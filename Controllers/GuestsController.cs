

namespace ActividadS4.API.Controllers
{

    using ActividadS4.API.Services;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    /// <summary>
    /// GuestsController maneja la gestión de huéspedes.
    /// Solo el gerente puede acceder a estos endpoints.
    /// Permite ver la lista de huéspedes y su estado de reserva.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GuestsController : ControllerBase
    {
        private readonly IGuestService _guestService;
        private readonly ILogger<GuestsController> _logger;

        /// <summary>
        /// Constructor: Recibe IGuestService inyectado desde Program.cs
        /// </summary>
        public GuestsController(IGuestService guestService, ILogger<GuestsController> logger)
        {
            _guestService = guestService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/guests
        /// Obtiene la lista completa de huéspedes registrados (solo gerente).
        /// Incluye estado de reserva (confirmada/pendiente) y habitación reservada.
        /// 
        /// Respuesta exitosa (200): Lista de huéspedes con sus datos de reserva
        /// Errores:
        /// 403: No es gerente
        /// 500: Error del servidor
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllGuests()
        {
            try
            {
                var guests = await _guestService.GetAllGuestsAsync();
                _logger.LogInformation($"Se obtuvieron {guests.Count} huéspedes");
                return Ok(guests);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener huéspedes: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener huéspedes" });
            }
        }

        /// <summary>
        /// GET /api/guests/{guestId}
        /// Obtiene la información detallada de un huésped específico (solo gerente).
        /// Incluye qué habitación reservó y en qué fechas.
        /// 
        /// Respuesta exitosa (200): Datos del huésped con su reserva
        /// Errores:
        /// 403: No es gerente
        /// 404: Huésped no encontrado
        /// 500: Error del servidor
        /// </summary>
        [HttpGet("{guestId}")]
        public async Task<IActionResult> GetGuestById(string guestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(guestId))
                    return BadRequest(new { message = "El ID del huésped es requerido" });

                var guest = await _guestService.GetGuestByIdAsync(guestId);

                if (guest == null)
                    return NotFound(new { message = "Huésped no encontrado" });

                return Ok(guest);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener huésped {guestId}: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener huésped" });
            }
        }
    }
}
