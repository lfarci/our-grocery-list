namespace api.Models;

/// <summary>
/// Fixed set of item categories
/// Categories are displayed in this order: Produce, Meat & Fish, Dairy, Bakery & Cereals, Household, Other
/// </summary>
public static class Category
{
    public const string Produce = "Produce";
    public const string MeatAndFish = "Meat & Fish";
    public const string Dairy = "Dairy";
    public const string BakeryAndCereals = "Bakery & Cereals";
    public const string Household = "Household";
    public const string Other = "Other";

    private static readonly HashSet<string> ValidCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        Produce,
        MeatAndFish,
        Dairy,
        BakeryAndCereals,
        Household,
        Other
    };

    /// <summary>
    /// Normalizes a category string to a valid category value
    /// Returns "Other" if the category is null, empty, or invalid
    /// Includes migration logic to map old category names to new ones
    /// </summary>
    public static string Normalize(string? category)
    {
        if (string.IsNullOrWhiteSpace(category))
        {
            return Other;
        }

        var trimmed = category.Trim();
        
        // Migration: Map old category names to new ones
        var migrationMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "Vegetables", Produce },
            { "Meat", MeatAndFish },
            { "Cereals", BakeryAndCereals },
            { "Dairy products", Dairy }
        };
        
        if (migrationMap.TryGetValue(trimmed, out var migratedCategory))
        {
            return migratedCategory;
        }
        
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
