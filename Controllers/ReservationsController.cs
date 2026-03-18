using System.Security.Claims;
namespace ActividadS4.API.Controllers
{
    using ActividadS4.API.DTOs;
    using ActividadS4.API.Services;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// ReservationsController maneja el sistema de reservas.
    /// Un huésped solo puede realizar UNA reserva en todo el sistema.
    /// Las reservas son inmutables — no se pueden modificar una vez creadas.
    /// </summary>

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ILogger<ReservationsController> _logger;

        /// <summary>
        /// Constructor: Recibe IReservationService inyectado desde Program.cs
        /// </summary>
        public ReservationsController(IReservationService reservationService, ILogger<ReservationsController> logger)
        {
            _reservationService = reservationService;
            _logger = logger;
        }

        /// <summary>
        /// POST /api/reservations
        /// Crea una reserva para el huésped autenticado.
        /// Valida que no haya reservado antes (reserva única).
        /// Calcula automáticamente noches y costo total con 15% de impuesto.
        /// 
        /// Cuerpo esperado (JSON):
        /// {
        ///   "roomId": "abc123",
        ///   "checkInDate": "2026-04-01",
        ///   "checkOutDate": "2026-04-05"
        /// }
        /// 
        /// Respuesta exitosa (201):
        /// {
        ///   "id": "...",
        ///   "roomNumber": "101",
        ///   "nights": 4,
        ///   "totalCost": 6900.00,
        ///   "status": "confirmed"
        /// }
        /// 
        /// Errores:
        /// 400: Ya reservó antes, fechas inválidas, habitación no disponible
        /// 403: No es huésped
        /// 500: Error del servidor
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "huesped,user,Huésped")]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationDto reservationDto)
        {
            try
            {
                if (reservationDto == null)
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });

                if (string.IsNullOrWhiteSpace(reservationDto.RoomId))
                    return BadRequest(new { message = "El ID de habitación es requerido" });

                if (reservationDto.CheckInDate >= reservationDto.CheckOutDate)
                    return BadRequest(new { message = "La fecha de salida debe ser posterior a la de entrada" });

                // Obtener el ID del huésped desde el token JWT
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst("userId")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "Token inválido" });

                var reservation = await _reservationService.CreateReservationAsync(reservationDto, userId);
                _logger.LogInformation($"Reserva creada para usuario {userId} en habitación {reservation.RoomNumber}");

                return StatusCode(201, reservation);
            }
            catch (InvalidOperationException ex)
            {
                // Ya reservó antes o habitación no disponible
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                // Fechas inválidas
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear reserva: {ex.Message}");
                return StatusCode(500, new { message = "Error al crear reserva" });
            }
        }

        /// <summary>
        /// GET /api/reservations
        /// Obtiene todas las reservas del sistema (solo gerente).
        /// 
        /// Respuesta exitosa (200): Lista de todas las reservas
        /// Errores:
        /// 403: No es gerente
        /// 500: Error del servidor
        /// </summary>
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllReservations()
        {
            try
            {
                var reservations = await _reservationService.GetAllReservationsAsync();
                _logger.LogInformation($"Se obtuvieron {reservations.Count} reservas");
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener reservas: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener reservas" });
            }
        }

        /// <summary>
        /// GET /api/reservations/my-reservation
        /// Obtiene la reserva del huésped autenticado.
        /// 
        /// Respuesta exitosa (200): Datos de la reserva
        /// Respuesta (204): El huésped no tiene reserva aún
        /// Errores:
        /// 403: No es huésped
        /// 500: Error del servidor
        /// </summary>
        [HttpGet("my-reservation")]
        [Authorize(Roles = "user,huesped,Huésped")]
        public async Task<IActionResult> GetMyReservation()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst("userId")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "Token inválido" });

                var reservation = await _reservationService.GetReservationByUserIdAsync(userId);

                if (reservation == null)
                    return NoContent(); // 204: No tiene reserva aún

                return Ok(reservation);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener reserva del usuario: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener reserva" });
            }
        }

        /// <summary>
        /// DELETE /api/reservations/{reservationId}
        /// Cancela la reserva del huésped autenticado.
        /// Aplica una tarifa de cancelación del 10%.
        /// 
        /// Respuesta exitosa (200): Reserva cancelada con detalles de reembolso
        /// Errores:
        /// 401: No autenticado
        /// 403: No es el dueño de la reserva
        /// 404: Reserva no encontrada
        /// 400: Reserva ya cancelada
        /// </summary>
        [HttpDelete("{reservationId}")]
        [Authorize(Roles = "huesped,user,Huésped")]
        public async Task<IActionResult> CancelReservation(string reservationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(reservationId))
                    return BadRequest(new { message = "El ID de reserva es requerido" });

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst("userId")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "Token inválido" });

                await _reservationService.CancelReservationAsync(reservationId, userId);
                
                _logger.LogInformation($"Reserva {reservationId} cancelada por usuario {userId}");

                return Ok(new { 
                    message = "Reserva cancelada exitosamente",
                    cancellationFeePercentage = 10,
                    messageDetail = "Se aplicó una tarifa de cancelación del 10%"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al cancelar reserva: {ex.Message}");
                return StatusCode(500, new { message = "Error al cancelar reserva" });
            }
        }
    }
}
