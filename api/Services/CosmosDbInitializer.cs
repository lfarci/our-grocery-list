using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace api.Services;

internal sealed class CosmosDbInitializer : IHostedService
{
    private const string DefaultDatabaseId = "GroceryListDb";
    private const string DefaultContainerId = "Items";
    private const string PartitionKeyPath = "/partitionKey";
    private const int DefaultThroughput = 400;

    private readonly CosmosClient _cosmosClient;
    private readonly ILogger<CosmosDbInitializer> _logger;
    private readonly bool _ensureCreated;
    private readonly string? _connectionString;
    private readonly string _databaseId;
    private readonly string _containerId;

    // Captures configuration needed to optionally create Cosmos DB resources on startup.
    public CosmosDbInitializer(
        CosmosClient cosmosClient,
        IConfiguration configuration,
        ILogger<CosmosDbInitializer> logger)
    {
        _cosmosClient = cosmosClient;
        _logger = logger;
        _connectionString = configuration["CosmosDbConnectionString"];
        _databaseId = configuration["CosmosDbDatabaseId"] ?? DefaultDatabaseId;
        _containerId = configuration["CosmosDbContainerId"] ?? DefaultContainerId;
        _ensureCreated = configuration.GetValue<bool>("CosmosDbEnsureCreated");
    }

    // Uses the Cosmos SDK to create the database and container when explicitly enabled.
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_ensureCreated)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            _logger.LogWarning("CosmosDbEnsureCreated is enabled but CosmosDbConnectionString is not configured.");
            return;
        }

        try
        {
            _logger.LogInformation(
                "Ensuring Cosmos DB database {DatabaseId} and container {ContainerId} exist.",
                _databaseId,
                _containerId);

            var databaseResponse = await _cosmosClient.CreateDatabaseIfNotExistsAsync(
                _databaseId,
                cancellationToken: cancellationToken);

            var containerProperties = new ContainerProperties(_containerId, PartitionKeyPath);

            await databaseResponse.Database.CreateContainerIfNotExistsAsync(
                containerProperties,
                DefaultThroughput,
                cancellationToken: cancellationToken);

            _logger.LogInformation("Cosmos DB database and container are ready.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure Cosmos DB database and container exist.");
            throw;
        }
    }

    // No teardown required for Cosmos DB resources at shutdown.
    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
