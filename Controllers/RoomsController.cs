namespace ActividadS4.API.Controllers
{
    using ActividadS4.API.DTOs;
    using ActividadS4.API.Services;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// RoomsController maneja la gestión de habitaciones del hotel.
    /// Gerente: puede crear, editar y eliminar habitaciones.
    /// Huésped: solo puede ver habitaciones disponibles.
    /// </summary>

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly ILogger<RoomsController> _logger;

        /// <summary>
        /// Constructor: Recibe IRoomService inyectado desde Program.cs
        /// </summary>
        public RoomsController(IRoomService roomService, ILogger<RoomsController> logger)
        {
            _roomService = roomService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/rooms
        /// Obtiene todas las habitaciones (solo gerente).
        /// 
        /// Respuesta exitosa (200): Lista de todas las habitaciones
        /// Errores:
        /// 403: No es gerente
        /// 500: Error del servidor
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "gerente")]
        public async Task<IActionResult> GetAllRooms()
        {
            try
            {
                var rooms = await _roomService.GetAllRoomsAsync();
                _logger.LogInformation($"Se obtuvieron {rooms.Count} habitaciones");
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener habitaciones: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener habitaciones" });
            }
        }

        /// <summary>
        /// GET /api/rooms/available
        /// Obtiene solo las habitaciones disponibles (huésped y gerente).
        /// 
        /// Respuesta exitosa (200): Lista de habitaciones disponibles
        /// Errores:
        /// 500: Error del servidor
        /// </summary>
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableRooms()
        {
            try
            {
                var rooms = await _roomService.GetAvailableRoomsAsync();
                _logger.LogInformation($"Se obtuvieron {rooms.Count} habitaciones disponibles");
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener habitaciones disponibles: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener habitaciones disponibles" });
            }
        }

        /// <summary>
        /// GET /api/rooms/{roomId}
        /// Obtiene una habitación específica por su ID.
        /// 
        /// Respuesta exitosa (200): Datos de la habitación
        /// Errores:
        /// 404: Habitación no encontrada
        /// 500: Error del servidor
        /// </summary>
        [HttpGet("{roomId}")]
        public async Task<IActionResult> GetRoomById(string roomId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomId))
                    return BadRequest(new { message = "El ID de habitación es requerido" });

                var room = await _roomService.GetRoomByIdAsync(roomId);

                if (room == null)
                    return NotFound(new { message = "Habitación no encontrada" });

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
        /// Crea una nueva habitación (solo gerente).
        /// 
        /// Cuerpo esperado (JSON):
        /// {
        ///   "roomNumber": "101",
        ///   "type": "Suite",
        ///   "capacity": 2,
        ///   "amenities": ["WiFi", "TV", "Jacuzzi"],
        ///   "photoUrls": ["https://..."],
        ///   "baseRate": 1500.00
        /// }
        /// 
        /// Respuesta exitosa (201): Habitación creada
        /// Errores:
        /// 400: Datos inválidos
        /// 403: No es gerente
        /// 500: Error del servidor
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "gerente")]
        public async Task<IActionResult> CreateRoom([FromBody] RoomDto roomDto)
        {
            try
            {
                if (roomDto == null)
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });

                if (string.IsNullOrWhiteSpace(roomDto.RoomNumber) ||
                    string.IsNullOrWhiteSpace(roomDto.Type))
                    return BadRequest(new { message = "Número y tipo de habitación son requeridos" });

                if (roomDto.BaseRate <= 0)
                    return BadRequest(new { message = "La tarifa base debe ser mayor a 0" });

                // Obtener el ID del gerente desde el token JWT
                var managerId = User.FindFirst("sub")?.Value ?? "unknown";

                var room = await _roomService.CreateRoomAsync(roomDto, managerId);
                _logger.LogInformation($"Habitación {room.RoomNumber} creada por gerente {managerId}");

                return StatusCode(201, room);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear habitación: {ex.Message}");
                return StatusCode(500, new { message = "Error al crear habitación" });
            }
        }

        /// <summary>
        /// PUT /api/rooms/{roomId}
        /// Actualiza la información de una habitación (solo gerente).
        /// 
        /// Respuesta exitosa (200): Habitación actualizada
        /// Errores:
        /// 400: Datos inválidos
        /// 403: No es gerente
        /// 404: Habitación no encontrada
        /// 500: Error del servidor
        /// </summary>
        [HttpPut("{roomId}")]
        [Authorize(Roles = "gerente")]
        public async Task<IActionResult> UpdateRoom(string roomId, [FromBody] RoomDto roomDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomId))
                    return BadRequest(new { message = "El ID de habitación es requerido" });

                if (roomDto == null)
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });

                var updatedRoom = await _roomService.UpdateRoomAsync(roomId, roomDto);

                if (updatedRoom == null)
                    return NotFound(new { message = "Habitación no encontrada" });

                _logger.LogInformation($"Habitación {roomId} actualizada correctamente");
                return Ok(updatedRoom);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar habitación: {ex.Message}");
                return StatusCode(500, new { message = "Error al actualizar habitación" });
            }
        }

        /// <summary>
        /// DELETE /api/rooms/{roomId}
        /// Elimina una habitación solo si no tiene reservas (solo gerente).
        /// 
        /// Respuesta exitosa (200): { "message": "Habitación eliminada correctamente" }
        /// Errores:
        /// 400: Habitación tiene reservas activas
        /// 403: No es gerente
        /// 404: Habitación no encontrada
        /// 500: Error del servidor
        /// </summary>
        [HttpDelete("{roomId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteRoom(string roomId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomId))
                    return BadRequest(new { message = "El ID de habitación es requerido" });

                var result = await _roomService.DeleteRoomAsync(roomId);

                if (!result)
                    return NotFound(new { message = "Habitación no encontrada" });

                _logger.LogInformation($"Habitación {roomId} eliminada correctamente");
                return Ok(new { message = "Habitación eliminada correctamente" });
            }
            catch (InvalidOperationException ex)
            {
                // Habitación tiene reservas, no se puede eliminar
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al eliminar habitación: {ex.Message}");
                return StatusCode(500, new { message = "Error al eliminar habitación" });
            }
        }
    }
}
