namespace ActividadS4.API.Services
{
    using ActividadS4.API.DTOs;
    using ActividadS4.API.Models;

    /// <summary>
    /// Define los contratos para la gestión de habitaciones.
    /// Solo el gerente puede crear, editar y eliminar habitaciones.
    /// </summary>
    public interface IRoomService
    {
        /// <summary>
        /// Obtiene todas las habitaciones registradas
        /// </summary>
        Task<List<Room>> GetAllRoomsAsync();

        /// <summary>
        /// Obtiene solo las habitaciones disponibles para reservar
        /// </summary>
        Task<List<Room>> GetAvailableRoomsAsync();

        /// <summary>
        /// Obtiene una habitación por su ID
        /// </summary>
        Task<Room?> GetRoomByIdAsync(string roomId);

        /// <summary>
        /// Crea una nueva habitación (solo gerente)
        /// </summary>
        Task<Room> CreateRoomAsync(RoomDto dto, string managerId);

        /// <summary>
        /// Edita la información de una habitación existente (solo gerente)
        /// </summary>
        Task<Room?> UpdateRoomAsync(string roomId, RoomDto dto);

        /// <summary>
        /// Elimina una habitación solo si no tiene reservas activas
        /// </summary>
        Task<bool> DeleteRoomAsync(string roomId);
    }
}
