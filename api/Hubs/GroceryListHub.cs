namespace api.Hubs;

/// <summary>
/// SignalR hub for real-time grocery list updates
/// Broadcasts item changes to all connected clients
/// </summary>
public class GroceryListHub
{
    /// <summary>
    /// Hub name for SignalR connection
    /// </summary>
    public const string HubName = "grocerylist";

    /// <summary>
    /// Method name for item created events
    /// </summary>
    public const string ItemCreatedMethod = "itemCreated";

    /// <summary>
    /// Method name for item updated events
    /// </summary>
    public const string ItemUpdatedMethod = "itemUpdated";

    /// <summary>
    /// Method name for item deleted events
    /// </summary>
    public const string ItemDeletedMethod = "itemDeleted";
}
