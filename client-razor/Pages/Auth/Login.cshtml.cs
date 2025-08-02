using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using client_razor.Services;
using client_razor.Models;
using System.ComponentModel.DataAnnotations;

namespace client_razor.Pages.Auth
{
    public class LoginModel : PageModel
    {
        private readonly IAuthService _authService;
        private readonly ILogger<LoginModel> _logger;

        public LoginModel(IAuthService authService, ILogger<LoginModel> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [BindProperty]
        public LoginRequestModel LoginRequest { get; set; } = new();

        public class LoginRequestModel
        {
            [Required(ErrorMessage = "El email es requerido")]
            [EmailAddress(ErrorMessage = "Email inválido")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "La contraseña es requerida")]
            [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
            public string Password { get; set; } = string.Empty;

            public bool RememberMe { get; set; }
            public string? ReturnUrl { get; set; }
        }

        public IActionResult OnGet(string? returnUrl = null)
        {
            // If user is already authenticated, redirect to home
            if (_authService.IsAuthenticated())
            {
                return RedirectToPage("/Index");
            }

            LoginRequest.ReturnUrl = returnUrl;
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var request = new client_razor.Models.LoginRequest
                {
                    Email = LoginRequest.Email,
                    Password = LoginRequest.Password
                };

                var response = await _authService.LoginAsync(request);

                if (response != null)
                {
                    _logger.LogInformation("User {Email} logged in successfully", LoginRequest.Email);

                    // Redirect to return URL or home
                    if (!string.IsNullOrEmpty(LoginRequest.ReturnUrl) && Url.IsLocalUrl(LoginRequest.ReturnUrl))
                    {
                        return Redirect(LoginRequest.ReturnUrl);
                    }
                    
                    TempData["Success"] = $"¡Bienvenido {response.User.FirstName}! Has iniciado sesión correctamente.";
                    return RedirectToPage("/Index");
                }
                else
                {
                    ModelState.AddModelError("", "Email o contraseña incorrectos. Por favor, inténtalo de nuevo.");
                    return Page();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for user {Email}", LoginRequest.Email);
                ModelState.AddModelError("", "Error al iniciar sesión. Por favor, inténtalo de nuevo.");
                return Page();
            }
        }
    }
}