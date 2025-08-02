using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DenounceBeasts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Iniciar sesión de usuario
    /// </summary>
    /// <param name="loginDto">Datos de login (email y contraseña)</param>
    /// <returns>Token JWT y datos del usuario</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            _logger.LogInformation("Intento de login para email: {Email}", loginDto.Email);
            
            var result = await _authService.LoginAsync(loginDto);
            
            _logger.LogInformation("Login exitoso para usuario: {UserId}", result.User.Id);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Login fallido para email: {Email}. Razón: {Reason}", loginDto.Email, ex.Message);
            return Unauthorized(new { message = "Credenciales inválidas" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error durante el login para email: {Email}", loginDto.Email);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Registrar nuevo usuario
    /// </summary>
    /// <param name="registerDto">Datos de registro</param>
    /// <returns>Token JWT y datos del usuario registrado</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            _logger.LogInformation("Intento de registro para email: {Email}", registerDto.Email);
            
            var result = await _authService.RegisterAsync(registerDto);
            
            _logger.LogInformation("Registro exitoso para usuario: {UserId}", result.User.Id);
            return CreatedAtAction(nameof(GetProfile), new { }, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registro fallido para email: {Email}. Razón: {Reason}", registerDto.Email, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error durante el registro para email: {Email}", registerDto.Email);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtener perfil del usuario autenticado
    /// </summary>
    /// <returns>Datos del usuario</returns>
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserAuthDto>> GetProfile()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo perfil de usuario");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Cambiar contraseña del usuario autenticado
    /// </summary>
    /// <param name="changePasswordDto">Datos para cambio de contraseña</param>
    /// <returns>Resultado de la operación</returns>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            var success = await _authService.ChangePasswordAsync(userId, changePasswordDto);
            if (!success)
            {
                return BadRequest(new { message = "No se pudo cambiar la contraseña" });
            }

            _logger.LogInformation("Contraseña cambiada exitosamente para usuario: {UserId}", userId);
            return Ok(new { message = "Contraseña cambiada exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cambiando contraseña");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Verificar si un email ya está registrado
    /// </summary>
    /// <param name="email">Email a verificar</param>
    /// <returns>True si el email existe, false en caso contrario</returns>
    [HttpGet("check-email")]
    [AllowAnonymous]
    public async Task<ActionResult<bool>> CheckEmailExists([FromQuery] string email)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email es requerido" });
            }

            var exists = await _authService.EmailExistsAsync(email);
            return Ok(new { exists });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verificando existencia de email: {Email}", email);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Verificar si el token actual es válido
    /// </summary>
    /// <returns>Datos del usuario si el token es válido</returns>
    [HttpGet("verify-token")]
    [Authorize]
    public async Task<ActionResult<UserAuthDto>> VerifyToken()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized(new { message = "Usuario no encontrado" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verificando token");
            return Unauthorized(new { message = "Token inválido" });
        }
    }
}