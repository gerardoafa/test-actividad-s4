namespace ActividadS4.API.DTOs;

/// <summary>
/// DTO para enviar información de habitaciones al frontend.
/// Solo expone los datos necesarios para mostrar disponibilidad, tarjetas y detalles básicos en la interfaz de huéspedes y gerentes.
/// No incluye información interna sensible (costos de proveedor, mantenimiento, etc.).
/// </summary>
public class RoomDto
{
    /// <summary>
    /// ID único de la habitación (GUID o string).
    /// El frontend lo usa para hacer reservas específicas o ver detalles.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Número o nombre visible de la habitación (ej: "101", "Suite Luna", "Bungalow 12").
    /// Se muestra en tarjetas y confirmaciones.
    /// </summary>
    public string NumberOrName { get; set; } = string.Empty;

    /// <summary>
    /// Alias para compatibilidad con frontend
    /// </summary>
    public string RoomNumber { get => NumberOrName; set => NumberOrName = value; }

    /// <summary>
    /// Tipo o categoría de la habitación.
    /// Ejemplos: "Estándar", "Junior Suite", "Suite Deluxe", "Familiar", "Con vista al mar".
    /// Útil para filtros y agrupaciones.
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Descripción breve (características principales, ambiente, etc.).
    /// Aparece en la página de detalles o al hacer hover.
    /// Mantenerla concisa (100–250 caracteres).
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Capacidad máxima de personas (adultos + niños según reglas del hotel).
    /// Ej: 2, 4, 6.
    /// </summary>
    public int Capacity { get; set; }

    /// <summary>
    /// Tarifa base por noche (sin impuestos ni promociones).
    /// El frontend puede usarla para mostrar precio inicial o calcular total aproximado.
    /// </summary>
    public double BasePricePerNight { get; set; }

    /// <summary>
    /// Calificación promedio de huéspedes (ej: 4.7 de 5).
    /// Basada en reseñas reales del sistema.
    /// </summary>
    public double AverageRating { get; set; }

    /// <summary>
    /// Cantidad total de reseñas/calificaciones recibidas.
    /// Útil para mostrar contexto: "4.8 ★ (basado en 142 opiniones)".
    /// </summary>
    public int TotalRatings { get; set; }

    /// <summary>
    /// Indica si la habitación está disponible para reservas
    /// </summary>
    public bool IsAvailable { get; set; } = true;

    /// <summary>
    /// Número de reservas de esta habitación
    /// </summary>
    public int ReservationCount { get; set; }
}
