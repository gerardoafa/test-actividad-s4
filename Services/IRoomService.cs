using ActividadS4.API.DTOs;
using ActividadS4.API.Models;

namespace ActividadS4.API.Services;

/// <summary>
/// Interfaz para el servicio de gestión de habitaciones
/// Define las operaciones principales disponibles para habitaciones
/// </summary>
public interface IRoomService
{
    /// <summary>
    /// Obtiene todas las habitaciones (con filtro opcional por tipo)
    /// </summary>
    /// <param name="type">Tipo de habitación para filtrar (opcional)</param>
    Task<List<RoomDto>> GetAllRooms(string? type = null);

    /// <summary>
    /// Obtiene una habitación específica por su ID
    /// </summary>
    /// <param name="roomId">Identificador único de la habitación</param>
    Task<RoomDto?> GetRoomById(string roomId);

    /// <summary>
    /// Crea una nueva habitación (solo gerentes)
    /// </summary>
    /// <param name="room">Datos de la habitación a crear</param>
    /// <param name="managerId">ID del gerente que realiza la acción</param>
    Task<Room> CreateRoom(Room room, string managerId);

    /// <summary>
    /// Actualiza una habitación existente (solo gerentes)
    /// </summary>
    /// <param name="roomId">ID de la habitación a modificar</param>
    /// <param name="room">Nuevos datos de la habitación</param>
    /// <param name="managerId">ID del gerente que realiza la acción</param>
    Task<Room> UpdateRoom(string roomId, Room room, string managerId);

    /// <summary>
    /// Elimina una habitación (solo gerentes)
    /// Normalmente solo si no tiene reservas ni reseñas activas
    /// </summary>
    /// <param name="roomId">ID de la habitación a eliminar</param>
    /// <param name="managerId">ID del gerente que realiza la acción</param>
    Task DeleteRoom(string roomId, string managerId);

    /// <summary>
    /// Busca habitaciones por número, nombre o tipo (búsqueda simple)
    /// </summary>
    /// <param name="searchTerm">Término de búsqueda (ej: "101", "Suite", "Deluxe")</param>
    Task<List<RoomDto>> SearchRooms(string searchTerm);
}
