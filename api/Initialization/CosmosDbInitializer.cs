using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace api.Initialization;

/// <summary>
/// Ensures Cosmos DB database and container exist for local emulator scenarios.
/// </summary>
internal sealed class CosmosDbInitializer : IHostedService
{
    private const int DefaultThroughput = 400;
    private const int MaxInitializeAttempts = 5;
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(2);
    private readonly CosmosClient _cosmosClient;
    private readonly ILogger<CosmosDbInitializer> _logger;
    private readonly string _databaseId;
    private readonly string _containerId;
    private readonly bool _shouldInitialize;

    /// <summary>
    /// Initializes the Cosmos DB initializer.
    /// </summary>
    /// <param name="cosmosClient">The Cosmos DB client.</param>
    /// <param name="logger">The logger instance.</param>
    /// <param name="databaseId">The Cosmos DB database id.</param>
    /// <param name="containerId">The Cosmos DB container id.</param>
    /// <param name="shouldInitialize">Whether to run initialization.</param>
    public CosmosDbInitializer(
        CosmosClient cosmosClient,
        ILogger<CosmosDbInitializer> logger,
        string databaseId,
        string containerId,
        bool shouldInitialize)
    {
        _cosmosClient = cosmosClient;
        _logger = logger;
        _databaseId = databaseId;
        _containerId = containerId;
        _shouldInitialize = shouldInitialize;
    }

    /// <summary>
    /// Creates the database and container when running against the emulator.
    /// </summary>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_shouldInitialize)
        {
            _logger.LogInformation("Cosmos DB initializer skipped because emulator mode is not enabled.");
            return;
        }

        _logger.LogWarning("Cosmos DB emulator initialization is enabled. Ensuring database {DatabaseId} and container {ContainerId} exist.", _databaseId, _containerId);

        for (var attempt = 1; attempt <= MaxInitializeAttempts; attempt++)
        {
            try
            {
                var database = await _cosmosClient.CreateDatabaseIfNotExistsAsync(_databaseId, cancellationToken: cancellationToken);
                var containerProperties = new ContainerProperties(_containerId, "/partitionKey");
                await database.Database.CreateContainerIfNotExistsAsync(containerProperties, DefaultThroughput, cancellationToken: cancellationToken);

                _logger.LogWarning("Cosmos DB emulator database {DatabaseId} and container {ContainerId} are ready.", _databaseId, _containerId);
                return;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Cosmos DB emulator initialization was cancelled.");
                throw;
            }
            catch (CosmosException ex) when (attempt < MaxInitializeAttempts)
            {
                _logger.LogWarning(ex, "Cosmos DB emulator initialization attempt {Attempt}/{MaxAttempts} failed. Retrying in {DelaySeconds}s.", attempt, MaxInitializeAttempts, RetryDelay.TotalSeconds);
                await Task.Delay(RetryDelay, cancellationToken);
            }
            catch (Exception ex) when (attempt < MaxInitializeAttempts)
            {
                _logger.LogWarning(ex, "Cosmos DB emulator initialization attempt {Attempt}/{MaxAttempts} failed. Retrying in {DelaySeconds}s.", attempt, MaxInitializeAttempts, RetryDelay.TotalSeconds);
                await Task.Delay(RetryDelay, cancellationToken);
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex, "Cosmos DB emulator initialization failed for database {DatabaseId} and container {ContainerId}.", _databaseId, _containerId);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while initializing Cosmos DB emulator resources.");
                throw;
            }
        }
    }

    /// <summary>
    /// No-op stop handler for the hosted service.
    /// </summary>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
