using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.SignalRService;

namespace api.Functions;

/// <summary>
/// Output binding for UpdateItem function with Azure SignalR Service support.
/// </summary>
public class UpdateItemOutput
{
    [HttpResult]
    public HttpResponseData? HttpResponse { get; set; }

    [SignalROutput(HubName = SignalRConstants.HubName)]
    public SignalRMessageAction[]? SignalRMessages { get; set; }
}
