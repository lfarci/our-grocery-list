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

// Configure Cosmos DB repository
var cosmosConnectionString = builder.Configuration["CosmosDbConnectionString"];
var databaseId = builder.Configuration["CosmosDbDatabaseId"] ?? "GroceryListDb";
var containerId = builder.Configuration["CosmosDbContainerId"] ?? "Items";

if (string.IsNullOrWhiteSpace(cosmosConnectionString))
{
    throw new InvalidOperationException(
        "CosmosDbConnectionString is required. " +
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

// Note: CORS is configured in local.settings.json for local development
// For Azure deployment, configure CORS in the Azure Portal

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

var host = builder.Build();

host.Run();
