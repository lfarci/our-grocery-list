using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;

namespace api.Functions;

/// <summary>
/// SignalR negotiation endpoint for real-time updates.
/// </summary>
public class SignalRFunctions
{
    private readonly ILogger<SignalRFunctions> _logger;

    public SignalRFunctions(ILogger<SignalRFunctions> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// GET/POST /api/negotiate - SignalR negotiation endpoint.
    /// </summary>
    [Function("Negotiate")]
    public async Task<HttpResponseData> Negotiate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "negotiate")] HttpRequestData req)
    {
        _logger.LogInformation("Negotiate called");

        // Stub: Return basic negotiation response
        // In production, this would integrate with Azure SignalR Service
        var negotiateResponse = new
        {
            url = "wss://stub-signalr-endpoint",
            accessToken = "stub-access-token"
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(negotiateResponse);
        return response;
    }
}
