using System.Net;
using api.Hubs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.SignalRService;
using Microsoft.Extensions.Logging;

namespace api.Functions;

/// <summary>
/// Azure Functions for SignalR Service integration
/// Provides negotiation endpoint for client connections
/// </summary>
public class SignalRFunctions
{
    private readonly ILogger<SignalRFunctions> _logger;

    public SignalRFunctions(ILogger<SignalRFunctions> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// POST /api/negotiate - SignalR negotiation endpoint
    /// Returns connection info for clients to establish SignalR connection
    /// </summary>
    [Function("negotiate")]
    public HttpResponseData Negotiate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "negotiate")] HttpRequestData req,
        [SignalRConnectionInfoInput(HubName = GroceryListHub.HubName)] SignalRConnectionInfo connectionInfo)
    {
        _logger.LogInformation("SignalR negotiation requested");

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.WriteAsJsonAsync(connectionInfo);
        
        return response;
    }
}
