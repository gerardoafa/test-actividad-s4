/// <summary>
/// DTO para manejar las reseñas/calificaciones que los huéspedes dejan sobre una habitación.
/// Se usa en:
/// 1. Listar reseñas de una habitación (GET)
/// 2. Crear una nueva reseña (POST)
/// 3. Editar una reseña existente (PUT) – si el sistema lo permite
/// </summary>
public class ReservationRatingDto
{
    /// <summary>
    /// ID único de la reseña
    /// Viene lleno en respuestas GET y PUT
    /// No se envía ni se usa al crear (POST)
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// ID de la habitación que se está calificando
    /// Permite al frontend mostrar rápidamente de qué habitación es
    /// </summary>
    public string RoomId { get; set; } = string.Empty;

    /// <summary>
    /// Nombre o número visible de la habitación (ej: "101", "Suite Deluxe")
    /// Para mostrar al usuario sin tener que hacer otra llamada
    /// </summary>
    public string RoomNameOrNumber { get; set; } = string.Empty;

    /// <summary>
    /// Puntuación dada por el huésped (rango recomendado: 1.0 a 5.0)
    /// El frontend debe validar el rango
    /// </summary>
    public double Score { get; set; }

    /// <summary>
    /// Comentario/texto de la reseña
    /// Puede estar vacío si el huésped solo pone puntuación
    /// </summary>
    public string Review { get; set; } = string.Empty;

    /// <summary>
    /// Nombre visible del huésped que escribió la reseña
    /// (puede ser nombre completo, nombre + inicial, o nickname según reglas del hotel)
    /// </summary>
    public string GuestName { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora en que se creó la reseña
    /// Útil para ordenar y mostrar antigüedad
    /// </summary>
    public DateTime CreatedAt { get; set; }

    // Opcional: si permites actualización posterior
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO que recibe el backend cuando un huésped crea una nueva reseña.
/// Solo contiene los campos que el usuario debe enviar.
/// </summary>
public class CreateReservationRatingDto
{
    /// <summary>
    /// ID de la habitación que se va a calificar
    /// (normalmente viene del contexto de la reserva confirmada)
    /// </summary>
    public string RoomId { get; set; } = string.Empty;

    /// <summary>
    /// Puntuación otorgada (1.0 a 5.0 normalmente)
    /// </summary>
    public double Score { get; set; }

    /// <summary>
    /// Comentario o texto de la experiencia (opcional)
    /// </summary>
    public string Review { get; set; } = string.Empty;
}
