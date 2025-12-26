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

// Log warning if connection string is missing but don't fail startup
// This allows preview deployments to succeed even without Cosmos DB configured
if (string.IsNullOrWhiteSpace(cosmosConnectionString))
{
    var startupLogger = LoggerFactory.Create(b => b.AddConsole()).CreateLogger<Program>();
    startupLogger.LogWarning(
        "CosmosDbConnectionString is not configured. " +
        "The Functions app will start but API calls will fail. " +
        "Please configure CosmosDbConnectionString in Azure application settings.");
    
    // Use a placeholder connection string to allow app startup
    // API calls will fail with proper error messages
    cosmosConnectionString = "AccountEndpoint=https://placeholder.documents.azure.com:443/;AccountKey=placeholder";
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
