using ActividadS4.API.DTOs;
using ActividadS4.API.Models;
using ActividadS4.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActividadS4.API.Controllers
{
    /// <summary>
    /// RoomsController maneja todo lo relacionado con habitaciones
    /// Endpoints para obtener, crear, editar y eliminar habitaciones
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly ILogger<RoomsController> _logger;

        /// <summary>
        /// Constructor: Recibe IRoomService inyectado
        /// </summary>
        public RoomsController(IRoomService roomService, ILogger<RoomsController> logger)
        {
            _roomService = roomService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/rooms
        ///
        /// Obtiene todas las habitaciones (con filtro opcional por tipo)
        ///
        /// Parámetros query (opcional):
        /// type: Filtrar por tipo de habitación específico
        /// Ejemplo: GET /api/rooms?type=Suite
        ///
        /// Respuesta exitosa (200):
        /// [
        ///   {
        ///     "id": "room_001",
        ///     "numberOrName": "101",
        ///     "type": "Estándar",
        ///     "capacity": 2,
        ///     "description": "Habitación cómoda con cama queen...",
        ///     "basePricePerNight": 120.00,
        ///     "averageRating": 4.7,
        ///     "totalRatings": 45
        ///   }
        /// ]
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllRooms([FromQuery] string? type = null)
        {
            try
            {
                var rooms = await _roomService.GetAllRooms(type);
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener habitaciones: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener habitaciones" });
            }
        }

        /// <summary>
        /// GET /api/rooms/{roomId}
        ///
        /// Obtiene una habitación específica por su ID
        ///
        /// Parámetro:
        /// roomId: ID de la habitación (en la URL)
        ///
        /// Respuesta exitosa (200): Detalle completo de la habitación
        ///
        /// Errores:
        /// 404: Habitación no encontrada
        /// </summary>
        [HttpGet("{roomId}")]
        public async Task<IActionResult> GetRoomById(string roomId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomId))
                {
                    return BadRequest(new { message = "El ID de habitación es requerido" });
                }

                var room = await _roomService.GetRoomById(roomId);
                if (room == null)
                {
                    return NotFound(new { message = "Habitación no encontrada" });
                }

                return Ok(room);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener habitación: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener habitación" });
            }
        }

        /// <summary>
        /// POST /api/rooms
        ///
        /// Crea una nueva habitación (SOLO GERENTE)
        ///
        /// Header requerido:
        /// Authorization: Bearer {token}
        ///
        /// Cuerpo esperado (JSON):
        /// {
        ///   "numberOrName": "205",
        ///   "type": "Suite Deluxe",
        ///   "capacity": 4,
        ///   "description": "Suite con vista al mar, jacuzzi y minibar",
        ///   "basePricePerNight": 250.00
        /// }
        ///
        /// Respuesta exitosa (201): Habitación creada
        ///
        /// Errores:
        /// 400: Datos inválidos
        /// 401: No autenticado
        /// 403: No es gerente
        /// </summary>
        [Authorize(Roles = "Gerente")]
        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] Room room)
        {
            try
            {
                if (room == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });
                }

                if (string.IsNullOrWhiteSpace(room.NumberOrName))
                {
                    return BadRequest(new { message = "El número o nombre de habitación es requerido" });
                }

                // Obtener el ID del gerente del token JWT
                var managerId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(managerId))
                {
                    return Unauthorized(new { message = "No autenticado" });
                }

                var createdRoom = await _roomService.CreateRoom(room, managerId);
                _logger.LogInformation($"Habitación creada: {createdRoom.NumberOrName}");

                return Created($"/api/rooms/{createdRoom.Id}", createdRoom);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear habitación: {ex.Message}");
                return StatusCode(500, new { message = "Error al crear habitación" });
            }
        }

        /// <summary>
        /// PUT /api/rooms/{roomId}
        ///
        /// Edita una habitación existente (SOLO GERENTE)
        ///
        /// Header requerido:
        /// Authorization: Bearer {token}
        ///
        /// Parámetro:
        /// roomId: ID de la habitación a editar
        ///
        /// Cuerpo: Mismo formato que CreateRoom
        ///
        /// Respuesta exitosa (200): Habitación actualizada
        ///
        /// Errores:
        /// 404: Habitación no encontrada
        /// 401: No autenticado
        /// 403: No es gerente
        /// </summary>
        [Authorize(Roles = "Gerente")]
        [HttpPut("{roomId}")]
        public async Task<IActionResult> UpdateRoom(string roomId, [FromBody] Room room)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomId))
                {
                    return BadRequest(new { message = "El ID de habitación es requerido" });
                }

                if (room == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });
                }

                var managerId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(managerId))
                {
                    return Unauthorized(new { message = "No autenticado" });
                }

                var updatedRoom = await _roomService.UpdateRoom(roomId, room, managerId);
                _logger.LogInformation($"Habitación actualizada: {roomId}");

                return Ok(updatedRoom);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar habitación: {ex.Message}");
                return StatusCode(500, new { message = "Error al actualizar habitación" });
            }
        }

        /// <summary>
        /// DELETE /api/rooms/{roomId}
        ///
        /// Elimina una habitación (SOLO GERENTE)
        /// Solo permite eliminar si no tiene reservas activas
        ///
        /// Header requerido:
        /// Authorization: Bearer {token}
        ///
        /// Respuesta exitosa (204): No content
        ///
        /// Errores:
        /// 404: Habitación no encontrada
        /// 400: Habitación tiene reservas
        /// 401: No autenticado
        /// 403: No es gerente
        /// </summary>
        [Authorize(Roles = "Gerente")]
        [HttpDelete("{roomId}")]
        public async Task<IActionResult> DeleteRoom(string roomId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomId))
                {
                    return BadRequest(new { message = "El ID de habitación es requerido" });
                }

                var managerId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(managerId))
                {
                    return Unauthorized(new { message = "No autenticado" });
                }

                await _roomService.DeleteRoom(roomId, managerId);
                _logger.LogInformation($"Habitación eliminada: {roomId}");

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al eliminar habitación: {ex.Message}");
                return StatusCode(500, new { message = "Error al eliminar habitación" });
            }
        }

        /// <summary>
        /// GET /api/rooms/search/{searchTerm}
        ///
        /// Busca habitaciones por número, nombre o tipo
        ///
        /// Parámetro:
        /// searchTerm: Término de búsqueda (ej: "Suite", "101", "Deluxe")
        ///
        /// Respuesta exitosa (200): Lista de habitaciones coincidentes
        /// </summary>
        [HttpGet("search/{searchTerm}")]
        public async Task<IActionResult> SearchRooms(string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "El término de búsqueda es requerido" });
                }

                var results = await _roomService.SearchRooms(searchTerm);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al buscar habitaciones: {ex.Message}");
                return StatusCode(500, new { message = "Error al buscar habitaciones" });
            }
        }
    }
}
