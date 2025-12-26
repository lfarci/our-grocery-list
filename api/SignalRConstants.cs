namespace api;

/// <summary>
/// Constants for Azure SignalR Service integration
/// </summary>
public static class SignalRConstants
{
    /// <summary>
    /// Hub name for SignalR connections - must match between client and server
    /// </summary>
    public const string HubName = "grocerylist";

    /// <summary>
    /// SignalR method names for broadcasting events to connected clients
    /// </summary>
    public static class Methods
    {
        public const string ItemCreated = "itemCreated";
        public const string ItemUpdated = "itemUpdated";
        public const string ItemDeleted = "itemDeleted";
    }
}
