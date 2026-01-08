namespace api.Models;

/// <summary>
/// Fixed set of item categories
/// Categories are displayed in this order: Vegetables, Meat, Cereals, Dairy products, Other
/// </summary>
public static class Category
{
    public const string Vegetables = "Vegetables";
    public const string Meat = "Meat";
    public const string Cereals = "Cereals";
    public const string DairyProducts = "Dairy products";
    public const string Other = "Other";

    private static readonly HashSet<string> ValidCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        Vegetables,
        Meat,
        Cereals,
        DairyProducts,
        Other
    };

    /// <summary>
    /// Normalizes a category string to a valid category value
    /// Returns "Other" if the category is null, empty, or invalid
    /// </summary>
    public static string Normalize(string? category)
    {
        if (string.IsNullOrWhiteSpace(category))
        {
            return Other;
        }

        var trimmed = category.Trim();
        
        // Use Contains for efficient case-insensitive lookup
        // then find the exact match with correct casing
        if (ValidCategories.Contains(trimmed))
        {
            // Find and return the category with correct casing
            return ValidCategories.First(c => string.Equals(c, trimmed, StringComparison.OrdinalIgnoreCase));
        }

        return Other;
    }

    /// <summary>
    /// Checks if a category string is valid
    /// </summary>
    public static bool IsValid(string? category)
    {
        if (string.IsNullOrWhiteSpace(category))
        {
            return false;
        }

        return ValidCategories.Contains(category.Trim());
    }
}
