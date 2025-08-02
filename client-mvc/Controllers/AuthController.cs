using DenounceBeasts.WebClient.Models.Domain;
using DenounceBeasts.WebClient.Models.ViewModels;
using DenounceBeasts.WebClient.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.WebClient.Controllers;

public class AuthController : Controller
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        // If user is already authenticated, redirect to home
        if (_authService.IsAuthenticated())
        {
            return RedirectToAction("Index", "Home");
        }

        ViewData["ReturnUrl"] = returnUrl;
        return View(new LoginViewModel { ReturnUrl = returnUrl });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var request = new LoginRequest
            {
                Email = model.Email,
                Password = model.Password
            };

            var response = await _authService.LoginAsync(request);

            _logger.LogInformation("User {Email} logged in successfully", model.Email);

            // Redirect to return URL or home
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            
            TempData["Success"] = $"¡Bienvenido {response.User.FirstName}! Has iniciado sesión correctamente.";
            return RedirectToAction("Index", "Home");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for user {Email}", model.Email);
            ModelState.AddModelError("", "Email o contraseña incorrectos. Por favor, inténtalo de nuevo.");
            return View(model);
        }
    }

    [HttpGet]
    public IActionResult Register()
    {
        // If user is already authenticated, redirect to home
        if (_authService.IsAuthenticated())
        {
            return RedirectToAction("Index", "Home");
        }

        return View(new RegisterViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            // Check if email is already taken
            var isEmailAvailable = await _authService.IsEmailAvailableAsync(model.Email);
            if (!isEmailAvailable)
            {
                ModelState.AddModelError("Email", "Este email ya está registrado. Por favor, usa otro.");
                return View(model);
            }

            var request = new RegisterRequest
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                Password = model.Password,
                ConfirmPassword = model.ConfirmPassword,
                Phone = model.Phone,
                Address = model.Address
            };

            var response = await _authService.RegisterAsync(request);

            _logger.LogInformation("User {Email} registered successfully", model.Email);

            TempData["Success"] = $"¡Bienvenido {response.User.FirstName}! Tu cuenta ha sido creada correctamente.";
            return RedirectToAction("Index", "Home");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed for user {Email}", model.Email);
            ModelState.AddModelError("", "Error al crear la cuenta. Por favor, inténtalo de nuevo.");
            return View(model);
        }
    }

    [HttpPost]
    [Authorize]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        var currentUser = _authService.GetCurrentUser();
        if (currentUser != null)
        {
            _logger.LogInformation("User {UserId} logging out", currentUser.Id);
        }

        await _authService.LogoutAsync();
        
        TempData["Info"] = "Has cerrado sesión correctamente.";
        return RedirectToAction("Index", "Home");
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Profile()
    {
        try
        {
            var user = await _authService.GetProfileAsync();
            if (user == null)
            {
                _logger.LogWarning("Failed to load user profile");
                TempData["Error"] = "Error al cargar el perfil de usuario.";
                return RedirectToAction("Index", "Home");
            }

            var viewModel = new UserProfileViewModel
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Roles = user.Roles,
                IsActive = user.IsActive
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading user profile");
            TempData["Error"] = "Error al cargar el perfil de usuario.";
            return RedirectToAction("Index", "Home");
        }
    }

    [HttpGet]
    [Authorize]
    public IActionResult ChangePassword()
    {
        return View(new ChangePasswordViewModel());
    }

    [HttpPost]
    [Authorize]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var request = new ChangePasswordRequest
            {
                CurrentPassword = model.CurrentPassword,
                NewPassword = model.NewPassword,
                ConfirmNewPassword = model.ConfirmNewPassword
            };

            var success = await _authService.ChangePasswordAsync(request);

            if (success)
            {
                _logger.LogInformation("Password changed successfully for current user");
                TempData["Success"] = "La contraseña ha sido cambiada correctamente.";
                return RedirectToAction("Profile");
            }
            else
            {
                ModelState.AddModelError("", "Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.");
                return View(model);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            ModelState.AddModelError("", "Error al cambiar la contraseña. Por favor, inténtalo de nuevo.");
            return View(model);
        }
    }

    [HttpGet]
    public IActionResult AccessDenied(string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        return View();
    }

    // AJAX endpoints for better UX
    [HttpPost]
    public async Task<IActionResult> CheckEmailAvailability([FromBody] string email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return Json(new { available = false, message = "Email es requerido" });
        }

        try
        {
            var isAvailable = await _authService.IsEmailAvailableAsync(email);
            return Json(new { 
                available = isAvailable, 
                message = isAvailable ? "Email disponible" : "Este email ya está registrado" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking email availability for {Email}", email);
            return Json(new { available = false, message = "Error al verificar email" });
        }
    }
}