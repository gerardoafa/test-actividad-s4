using ActividadS4.API.DTOs;
using ActividadS4.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActividadS4.API.Controllers
{
    /// <summary>
    /// RoomRatingsController maneja todo lo relacionado con reseñas/calificaciones de habitaciones
    /// Endpoints para crear, obtener, editar y eliminar reseñas
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RoomRatingsController : ControllerBase
    {
        private readonly IRoomRatingService _ratingService;
        private readonly ILogger<RoomRatingsController> _logger;

        /// <summary>
        /// Constructor: Recibe IRoomRatingService inyectado
        /// </summary>
        public RoomRatingsController(IRoomRatingService ratingService, ILogger<RoomRatingsController> logger)
        {
            _ratingService = ratingService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/roomratings/room/{roomId}
        ///
        /// Obtiene todas las reseñas/calificaciones de una habitación
        ///
        /// Parámetro:
        /// roomId: ID de la habitación
        ///
        /// Respuesta exitosa (200):
        /// [
        ///   {
        ///     "id": "rating_001",
        ///     "roomId": "room_abc123",
        ///     "roomNameOrNumber": "101 - Estándar",
        ///     "score": 4.5,
        ///     "review": "Muy cómoda y limpia",
        ///     "guestName": "María López",
        ///     "createdAt": "2026-03-10T14:45:00Z"
        ///   }
        /// ]
        /// </summary>
        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetRatingsByRoomId(string roomId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomId))
                {
                    return BadRequest(new { message = "El ID de habitación es requerido" });
                }

                var ratings = await _ratingService.GetRatingsByRoomId(roomId);
                return Ok(ratings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener reseñas: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener reseñas" });
            }
        }

        /// <summary>
        /// GET /api/roomratings/user/{userId}
        ///
        /// Obtiene todas las reseñas hechas por un huésped
        ///
        /// Parámetro:
        /// userId: ID del huésped
        ///
        /// Respuesta exitosa (200): Lista de ReservationRatingDto
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetRatingsByUserId(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return BadRequest(new { message = "El ID de usuario es requerido" });
                }

                var ratings = await _ratingService.GetRatingsByUserId(userId);
                return Ok(ratings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener reseñas del usuario: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener reseñas" });
            }
        }

        /// <summary>
        /// POST /api/roomratings
        ///
        /// Crea una nueva reseña/calificación para una habitación
        /// (solo huéspedes que hayan tenido reserva confirmada y finalizada)
        ///
        /// Header requerido:
        /// Authorization: Bearer {token}
        ///
        /// Cuerpo esperado (JSON):
        /// {
        ///   "roomId": "room_abc123",
        ///   "score": 4.5,
        ///   "review": "Excelente atención y muy limpia"
        /// }
        ///
        /// Respuesta exitosa (201): La reseña creada
        ///
        /// Errores:
        /// 400: Score fuera de rango, usuario ya calificó esta habitación, no tiene reserva válida
        /// 401: No autenticado
        /// </summary>
        [Authorize(Roles = "Huésped")]
        [HttpPost]
        public async Task<IActionResult> CreateRating([FromBody] CreateReservationRatingDto createRatingDto)
        {
            try
            {
                if (createRatingDto == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });
                }

                if (string.IsNullOrWhiteSpace(createRatingDto.RoomId))
                {
                    return BadRequest(new { message = "El ID de habitación es requerido" });
                }

                if (createRatingDto.Score < 1 || createRatingDto.Score > 5)
                {
                    return BadRequest(new { message = "La calificación debe estar entre 1 y 5" });
                }

                // Obtener el ID del huésped del token JWT
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return Unauthorized(new { message = "No autenticado" });
                }

                var rating = await _ratingService.CreateRating(createRatingDto, userId);
                _logger.LogInformation($"Reseña creada: Huésped {userId} calificó habitación {createRatingDto.RoomId}");

                return Created($"/api/roomratings/{rating.Id}", rating);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear reseña: {ex.Message}");
                return StatusCode(500, new { message = "Error al crear reseña" });
            }
        }

        /// <summary>
        /// PUT /api/roomratings/{ratingId}
        ///
        /// Edita una reseña existente (solo el huésped propietario)
        ///
        /// Header requerido:
        /// Authorization: Bearer {token}
        ///
        /// Parámetro:
        /// ratingId: ID de la reseña a editar
        ///
        /// Cuerpo: Mismo formato que CreateReservationRatingDto
        ///
        /// Respuesta exitosa (200): La reseña actualizada
        ///
        /// Errores:
        /// 404: Reseña no encontrada
        /// 403: No eres el propietario
        /// 401: No autenticado
        /// </summary>
        [Authorize(Roles = "Huésped")]
        [HttpPut("{ratingId}")]
        public async Task<IActionResult> UpdateRating(string ratingId, [FromBody] CreateReservationRatingDto createRatingDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ratingId))
                {
                    return BadRequest(new { message = "El ID de reseña es requerido" });
                }

                if (createRatingDto == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });
                }

                if (createRatingDto.Score < 1 || createRatingDto.Score > 5)
                {
                    return BadRequest(new { message = "La calificación debe estar entre 1 y 5" });
                }

                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return Unauthorized(new { message = "No autenticado" });
                }

                var rating = await _ratingService.UpdateRating(ratingId, createRatingDto, userId);
                _logger.LogInformation($"Reseña actualizada: {ratingId}");

                return Ok(rating);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar reseña: {ex.Message}");
                return StatusCode(500, new { message = "Error al actualizar reseña" });
            }
        }

        /// <summary>
        /// DELETE /api/roomratings/{ratingId}
        ///
        /// Elimina una reseña (solo el huésped propietario)
        ///
        /// Header requerido:
        /// Authorization: Bearer {token}
        ///
        /// Parámetro:
        /// ratingId: ID de la reseña a eliminar
        ///
        /// Respuesta exitosa (204): No content
        ///
        /// Errores:
        /// 404: Reseña no encontrada
        /// 403: No eres el propietario
        /// 401: No autenticado
        /// </summary>
        [Authorize(Roles = "Huésped")]
        [HttpDelete("{ratingId}")]
        public async Task<IActionResult> DeleteRating(string ratingId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ratingId))
                {
                    return BadRequest(new { message = "El ID de reseña es requerido" });
                }

                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return Unauthorized(new { message = "No autenticado" });
                }

                await _ratingService.DeleteRating(ratingId, userId);
                _logger.LogInformation($"Reseña eliminada: {ratingId}");

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al eliminar reseña: {ex.Message}");
                return StatusCode(500, new { message = "Error al eliminar reseña" });
            }
        }
    }
}
