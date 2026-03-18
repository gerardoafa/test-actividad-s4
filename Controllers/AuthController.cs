using ActividadS4.API.DTOs;
using ActividadS4.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ActividadS4.API.Controllers
{
    /// <summary>
    /// AuthController maneja todo lo relacionado con autenticación
    /// Endpoints para registro e inicio de sesión de huéspedes y gerentes
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        /// <summary>
        /// Constructor: Recibe IAuthService inyectado
        /// Los servicios se inyectan automáticamente desde Program.cs
        /// </summary>
        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// POST /api/auth/register
        ///
        /// Endpoint para registrar un nuevo usuario (por defecto como Huésped)
        ///
        /// Cuerpo esperado (JSON):
        /// {
        ///   "email": "usuario@example.com",
        ///   "password": "demo123",
        ///   "fullName": "María López"
        /// }
        ///
        /// Respuesta exitosa (201):
        /// {
        ///   "id": "user_abc123",
        ///   "email": "usuario@example.com",
        ///   "fullName": "María López",
        ///   "role": "Huésped",
        ///   "createdAt": "2025-03-16T21:15:00Z"
        /// }
        ///
        /// Errores:
        /// 400: Email ya existe, contraseña muy corta, datos inválidos
        /// 500: Error del servidor
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (registerDto == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });
                }

                if (string.IsNullOrWhiteSpace(registerDto.Email) ||
                    string.IsNullOrWhiteSpace(registerDto.Password))
                {
                    return BadRequest(new { message = "Email y contraseña son requeridos" });
                }

                var user = await _authService.Register(registerDto);
                _logger.LogInformation($"Usuario registrado: {user.Email} ({user.Role})");

                return Created($"/api/auth/users/{user.Id}", user);
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
                _logger.LogError($"Error en registro: {ex.Message}");
                return StatusCode(500, new { message = "Error al registrar usuario" });
            }
        }

        /// <summary>
        /// POST /api/auth/login
        ///
        /// Endpoint para iniciar sesión (huésped o gerente)
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (loginDto == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición es requerido" });
                }

                if (string.IsNullOrWhiteSpace(loginDto.Email) ||
                    string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new { message = "Email y contraseña son requeridos" });
                }

                var (user, token) = await _authService.Login(loginDto);
                _logger.LogInformation($"Usuario inició sesión: {user.Email} ({user.Role})");

                var response = new AuthResponseDto
                {
                    Success = true,
                    Message = "Inicio de sesión exitoso",
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        FullName = user.Fullname,
                        Email = user.Email,
                        Role = user.Role
                    }
                };

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error en login: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error al iniciar sesión"
                });
            }
        }

        /// <summary>
        /// GET /api/auth/users/{userId}
        /// Obtiene información básica de un usuario por su ID
        /// </summary>
        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return BadRequest(new { message = "El ID de usuario es requerido" });
                }

                var user = await _authService.GetUserById(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    FullName = user.Fullname,
                    Email = user.Email,
                    Role = user.Role
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener usuario: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener usuario" });
            }
        }
    }
}
