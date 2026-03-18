namespace ActividadS4.API.Services
{
    using ActividadS4.API.DTOs;
    using ActividadS4.API.Models;
    /// <summary>
    /// Define los contratos para el sistema de reservas.
    /// Un huésped solo puede realizar UNA reserva en todo el sistema.
    /// </summary>
    public interface IReservationService
    {
        /// <summary>
        /// Crea una reserva para el huésped.
        /// Valida que no haya reservado antes y que la habitación esté disponible.
        /// Calcula automáticamente noches y costo total con impuestos (15%).
        /// </summary>
        Task<Reservation> CreateReservationAsync(ReservationDto dto, string userId);

        /// <summary>
        /// Obtiene todas las reservas del sistema (solo gerente)
        /// </summary>
        Task<List<Reservation>> GetAllReservationsAsync();

        /// <summary>
        /// Obtiene la reserva de un huésped específico
        /// </summary>
        Task<Reservation?> GetReservationByUserIdAsync(string userId);
    }
}
