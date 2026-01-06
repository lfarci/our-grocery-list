using System;
using System.Collections.Generic;

namespace api.Models;

public static class QuantityUnits
{
    public const string Grams = "g";
    public const string Kilograms = "kg";
    public const string Liters = "L";
    public const string Milliliters = "ml";
    public const string Centiliters = "cl";
    public const string Portion = "portion";
    public const string Piece = "piece";

    private static readonly Dictionary<string, string> CanonicalUnits = new(StringComparer.OrdinalIgnoreCase)
    {
        { Grams, Grams },
        { Kilograms, Kilograms },
        { Liters, Liters },
        { Milliliters, Milliliters },
        { Centiliters, Centiliters },
        { Portion, Portion },
        { Piece, Piece }
    };

    public static bool IsValid(string? unit)
    {
        if (string.IsNullOrWhiteSpace(unit))
        {
            return false;
        }

        return CanonicalUnits.ContainsKey(unit.Trim());
    }

    public static bool TryNormalize(string? unit, out string? normalized)
    {
        normalized = null;
        if (string.IsNullOrWhiteSpace(unit))
        {
            return false;
        }

        if (CanonicalUnits.TryGetValue(unit.Trim(), out var canonical))
        {
            normalized = canonical;
            return true;
        }

        return false;
    }
}
