namespace api.Models;

public static class ItemState
{
    public const string Active = "active";
    public const string Checked = "checked";
    public const string Archived = "archived";

    private static readonly HashSet<string> ValidStates = new(StringComparer.OrdinalIgnoreCase)
    {
        Active,
        Checked,
        Archived
    };

    public static string Normalize(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return Active;
        }

        var trimmed = state.Trim();
        if (!ValidStates.Contains(trimmed))
        {
            return Active;
        }

        return trimmed.ToLowerInvariant();
    }

    public static bool IsValid(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return false;
        }

        return ValidStates.Contains(state.Trim());
    }
}
