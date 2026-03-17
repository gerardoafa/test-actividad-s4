using ActividadS4.API.DTOs;
using ActividadS4.API.Models;

namespace ActividadS4.API.Services;

/// <summary>
/// Interfaz para el servicio de gestión de reseñas/calificaciones de habitaciones
/// Define las operaciones principales disponibles para las reseñas de huéspedes
/// </summary>
public interface IRoomRatingService
{
    /// <summary>
    /// Obtiene todas las reseñas/calificaciones de una habitación específica
    /// </summary>
    /// <param name="roomId">Identificador único de la habitación</param>
    Task<List<ReservationRatingDto>> GetRatingsByRoomId(string roomId);

    /// <summary>
    /// Obtiene todas las reseñas realizadas por un huésped específico
    /// </summary>
    /// <param name="userId">Identificador único del huésped/usuario</param>
    Task<List<ReservationRatingDto>> GetRatingsByUserId(string userId);

    /// <summary>
    /// Crea una nueva reseña/calificación para una habitación
    /// </summary>
    /// <param name="createRatingDto">Datos de la nueva reseña a crear</param>
    /// <param name="userId">ID del huésped que realiza la reseña</param>
    Task<ReservationRating> CreateRating(CreateReservationRatingDto createRatingDto, string userId);

    /// <summary>
    /// Actualiza una reseña/calificación existente
    /// </summary>
    /// <param name="ratingId">ID de la reseña que se va a modificar</param>
    /// <param name="createRatingDto">Nuevos datos de la reseña (score y review)</param>
    /// <param name="userId">ID del huésped que está editando (debe ser el propietario)</param>
    Task<ReservationRating> UpdateRating(string ratingId, CreateReservationRatingDto createRatingDto, string userId);

    /// <summary>
    /// Elimina una reseña/calificación existente
    /// </summary>
    /// <param name="ratingId">ID de la reseña a eliminar</param>
    /// <param name="userId">ID del huésped que realiza la eliminación (debe ser el propietario)</param>
    Task DeleteRating(string ratingId, string userId);

    /// <summary>
    /// Verifica si un huésped ya ha calificado una habitación específica
    /// </summary>
    /// <param name="userId">ID del huésped</param>
    /// <param name="roomId">ID de la habitación</param>
    /// <returns>true si ya existe una reseña de ese huésped para esa habitación</returns>
    Task<bool> HasUserRatedRoom(string userId, string roomId);
}
