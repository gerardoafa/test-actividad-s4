namespace ActividadS4.API.Services
{/// <summary>
/// Define los contratos para la gestión de huéspedes.
/// Solo el gerente puede acceder a esta información.
/// </summary>

    using ActividadS4.API.DTOs;
    using ActividadS4.API.Models;
    public interface IGuestService
    {
        /// <summary>
        /// Obtiene la lista completa de huéspedes registrados
        /// </summary>
        Task<List<UserDto>> GetAllGuestsAsync();

        /// <summary>
        /// Obtiene la información detallada de un huésped con su reserva
        /// </summary>
        Task<UserDto?> GetGuestByIdAsync(string guestId);
    }
}
