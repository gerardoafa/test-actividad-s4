using ActividadS4.API.Services;

namespace ActividadS4.API.Controllers;
using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Timestamp = Google.Cloud.Firestore.Timestamp;

/// <summary>
/// AuthController maneja todo lo relacionado con autenticación
/// Endpoints públicos: register, login, reset-password
/// Endpoint protegido: obtener usuario por ID
/// </summary>do, podemos eliminar este controlador
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    /// <summary>
    /// Constructor: Recibe IAuthService inyectado desde Program.cs
    /// </summary>
    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// POST /api/auth/register
    /// Registra un nuevo usuario como huésped por defecto.
    /// 
    /// Cuerpo esperado (JSON):
    /// {
    ///   "email": "huesped@example.com",
    ///   "password": "demo123",
    ///   "fullName": "Juan Pérez"
    /// }
    /// 
    /// Respuesta exitosa (201):
    /// {
    ///   "success": true,
    ///   "message": "Usuario registrado exitosamente",
    ///   "token": "eyJhbGci...",
    ///   "user": { "id": "...", "email": "...", "role": "huesped" }
    /// }
    /// 
    /// Errores:
    /// 400: Email ya existe, password muy corta, datos inválidos
    /// 500: Error del servidor
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            if (registerDto == null)
                return BadRequest(new { message = "El cuerpo de la petición es requerido" });

            if (string.IsNullOrWhiteSpace(registerDto.Email) ||
                string.IsNullOrWhiteSpace(registerDto.Password))
                return BadRequest(new { message = "Email y contraseña son requeridos" });

            var response = await _authService.Register(registerDto);
            _logger.LogInformation($"Usuario registrado: {registerDto.Email}");

            // 201 Created con la respuesta que incluye el token
            return StatusCode(201, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error en registro: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Error al registrar usuario" });
        }
    }

    /// <summary>
    /// POST /api/auth/login
    /// Inicia sesión y retorna el token JWT.
    /// 
    /// Cuerpo esperado (JSON):
    /// {
    ///   "email": "huesped@example.com",
    ///   "password": "demo123"
    /// }
    /// 
    /// Respuesta exitosa (200):
    /// {
    ///   "success": true,
    ///   "message": "Login exitoso",
    ///   "token": "eyJhbGci...",
    ///   "user": { "id": "...", "role": "gerente" o "huesped" }
    /// }
    /// 
    /// El token debe guardarse en el frontend y enviarse en cada petición:
    /// Authorization: Bearer {token}
    /// 
    /// Errores:
    /// 400: Email o contraseña incorrectos
    /// 500: Error del servidor
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            if (loginDto == null)
                return BadRequest(new { message = "El cuerpo de la petición es requerido" });

            if (string.IsNullOrWhiteSpace(loginDto.Email) ||
                string.IsNullOrWhiteSpace(loginDto.Password))
                return BadRequest(new { message = "Email y contraseña son requeridos" });

            var (user, token) = await _authService.Login(loginDto);
            _logger.LogInformation($"Usuario inició sesión: {user.Email}");

            var response = new AuthResponseDto
            {
                Success = true,
                Message = "Login exitoso",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.Fullname,
                    Email = user.Email,
                    Role = user.Role,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    HasReserved = user.HasReserved,
                    ReservedRoom = user.ReservedRoom,
                    ReservedDates = user.ReservedDates
                }
            };

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error en login: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Error al iniciar sesión" });
        }
    }

    /// <summary>
    /// POST /api/auth/reset-password
    /// Envía un correo de recuperación de contraseña.
    /// 
    /// Cuerpo esperado (JSON):
    /// {
    ///   "email": "huesped@example.com"
    /// }
    /// 
    /// Respuesta exitosa (200):
    /// { "message": "Correo de recuperación enviado" }
    /// 
    /// Errores:
    /// 400: Email no proporcionado
    /// 500: Error del servidor
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] string email)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "El email es requerido" });

            var result = await _authService.ResetPasswordAsync(email);

            if (!result)
                return BadRequest(new { message = "No se pudo enviar el correo de recuperación" });

            return Ok(new { message = "Correo de recuperación enviado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error en reset password: {ex.Message}");
            return StatusCode(500, new { message = "Error al enviar correo de recuperación" });
        }
    }

    /// <summary>
    /// GET /api/auth/users/{userId}
    /// Obtiene la información de un usuario por su ID.
    /// Requiere token JWT válido.
    /// 
    /// Respuesta exitosa (200):
    /// {
    ///   "id": "...",
    ///   "fullName": "Juan Pérez",
    ///   "email": "...",
    ///   "role": "huesped",
    ///   "hasReserved": false
    /// }
    /// 
    /// Errores:
    /// 404: Usuario no encontrado
    /// </summary>
    [HttpGet("users/{userId}")]
    [Authorize]
    public async Task<IActionResult> GetUser(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest(new { message = "El ID de usuario es requerido" });

            var user = await _authService.GetUserById(userId);

            if (user == null)
                return NotFound(new { message = "Usuario no encontrado" });

            var userDto = new UserDto
            {
                Id = user.Id,
                FullName = user.Fullname,
                Email = user.Email,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl,
                HasReserved = user.HasReserved,
                ReservedRoom = user.ReservedRoom,
                ReservedDates = user.ReservedDates
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