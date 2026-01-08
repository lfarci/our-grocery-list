using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.SignalRService;

namespace api.Functions;

/// <summary>
/// Output binding for CreateItem function with Azure SignalR Service support.
/// </summary>
public class CreateItemOutput
{
    [HttpResult]
    public HttpResponseData? HttpResponse { get; set; }

    [SignalROutput(HubName = SignalRConstants.HubName)]
    public SignalRMessageAction[]? SignalRMessages { get; set; }
}
