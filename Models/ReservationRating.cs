namespace ActividadS4.API.Models;

/// <summary>
/// ReservationRating representa una reseña/calificación que un huésped da a una habitación
/// Se almacena como documento en la colección "roomRatings" de Firestore
///
/// Relación: 
/// - Un huésped puede tener múltiples reseñas
/// - Una habitación puede tener múltiples reseñas
///
/// </summary>
public class ReservationRating
{
    /**
     * Identificador único para la reseña
     * String porque Firestore lo gestiona como ID del documento
     * Ejemplo: rating_abc123-xyz
     */
    public string Id { get; set; } = string.Empty;

    /**
     * RoomId de la habitación calificada
     * Necesario para saber a qué habitación pertenece la reseña
     */
    public string RoomId { get; set; } = string.Empty;

    /**
     * RoomNameOrNumber: Número o nombre visible de la habitación
     * Se guarda para mostrar rápidamente sin consultar otra colección
     * Ejemplo: "101", "Suite Deluxe"
     */
    public string RoomNameOrNumber { get; set; } = string.Empty;

    /**
     * UserId / GuestId: Identificador del huésped que realizó la reseña
     * Ejemplo: user_456def-789
     */
    public string UserId { get; set; } = string.Empty;

    /**
     * GuestName: Nombre visible del huésped que escribió la reseña
     * Ejemplo: "María López", "Juan Pérez G."
     */
    public string GuestName { get; set; } = string.Empty;

    /**
     * Score: Calificación que otorga el huésped
     * Rango recomendado: 1.0 - 5.0 (estándar en reseñas hoteleras)
     */
    public double Score { get; set; }

    /**
     * Review: Comentario o opinión del huésped sobre su experiencia
     * Puede estar vacío si solo pone puntuación
     */
    public string Review { get; set; } = string.Empty;

    /**
     * CreatedAt: Fecha y hora en que se creó la reseña
     */
    public DateTime CreatedAt { get; set; }

    /**
     * UpdatedAt: Fecha y hora de la última actualización (si se permite editar)
     */
    public DateTime UpdatedAt { get; set; }
}
