using System.Text.Json;
using System.Text.Json.Serialization;
using api.Repositories;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// Configure JSON serialization to use camelCase
builder.Services.Configure<JsonSerializerOptions>(options =>
{
    options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// Configure repository based on storage provider setting
var storageProvider = builder.Configuration["StorageProvider"] ?? "InMemory";

if (storageProvider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase))
{
    // Configure Cosmos DB
    var cosmosConnectionString = builder.Configuration["CosmosDbConnectionString"];
    var databaseId = builder.Configuration["CosmosDbDatabaseId"] ?? "GroceryListDb";
    var containerId = builder.Configuration["CosmosDbContainerId"] ?? "Items";

    if (string.IsNullOrWhiteSpace(cosmosConnectionString))
    {
        throw new InvalidOperationException(
            "CosmosDbConnectionString is required when StorageProvider is set to CosmosDb. " +
            "Please configure it in local.settings.json or Azure application settings.");
    }

    builder.Services.AddSingleton<CosmosClient>(sp =>
    {
        var logger = sp.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Initializing Cosmos DB client with database: {DatabaseId}, container: {ContainerId}", 
            databaseId, containerId);

        var clientOptions = new CosmosClientOptions
        {
            SerializerOptions = new CosmosSerializationOptions
            {
                PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
            },
            ConnectionMode = ConnectionMode.Direct
        };

        return new CosmosClient(cosmosConnectionString, clientOptions);
    });

    builder.Services.AddSingleton<IItemRepository>(sp =>
    {
        var cosmosClient = sp.GetRequiredService<CosmosClient>();
        var logger = sp.GetRequiredService<ILogger<CosmosDbItemRepository>>();
        return new CosmosDbItemRepository(cosmosClient, logger, databaseId, containerId);
    });
}
else
{
    // Default to in-memory storage
    builder.Services.AddSingleton<IItemRepository, InMemoryItemRepository>();
}

// Note: CORS is configured in local.settings.json for local development
// For Azure deployment, configure CORS in the Azure Portal

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

var host = builder.Build();

// Log the configured storage provider
var logger = host.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Application started with storage provider: {StorageProvider}", storageProvider);

host.Run();
