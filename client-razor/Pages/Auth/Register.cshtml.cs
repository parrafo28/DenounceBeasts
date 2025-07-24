using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using client_razor.Services;
using client_razor.Models;
using System.ComponentModel.DataAnnotations;

namespace client_razor.Pages.Auth
{
    public class RegisterModel : PageModel
    {
        private readonly IAuthService _authService;
        private readonly ILogger<RegisterModel> _logger;

        public RegisterModel(IAuthService authService, ILogger<RegisterModel> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [BindProperty]
        public RegisterRequestModel RegisterRequest { get; set; } = new();

        public class RegisterRequestModel
        {
            [Required(ErrorMessage = "El nombre es requerido")]
            [StringLength(50, ErrorMessage = "El nombre no puede exceder 50 caracteres")]
            public string FirstName { get; set; } = string.Empty;

            [Required(ErrorMessage = "El apellido es requerido")]
            [StringLength(50, ErrorMessage = "El apellido no puede exceder 50 caracteres")]
            public string LastName { get; set; } = string.Empty;

            [Required(ErrorMessage = "El email es requerido")]
            [EmailAddress(ErrorMessage = "Email inválido")]
            public string Email { get; set; } = string.Empty;

            [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
            public string? Phone { get; set; }

            [StringLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
            public string? Address { get; set; }

            [Required(ErrorMessage = "La contraseña es requerida")]
            [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
            public string Password { get; set; } = string.Empty;

            [Required(ErrorMessage = "Debes confirmar la contraseña")]
            [Compare("Password", ErrorMessage = "Las contraseñas no coinciden")]
            public string ConfirmPassword { get; set; } = string.Empty;
        }

        public IActionResult OnGet()
        {
            // If user is already authenticated, redirect to home
            if (_authService.IsAuthenticated())
            {
                return RedirectToPage("/Index");
            }

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
                // Check if email is already taken
                var isEmailAvailable = await _authService.IsEmailAvailableAsync(RegisterRequest.Email);
                if (!isEmailAvailable)
                {
                    ModelState.AddModelError("RegisterRequest.Email", "Este email ya está registrado. Por favor, usa otro.");
                    return Page();
                }

                var request = new client_razor.Models.RegisterRequest
                {
                    FirstName = RegisterRequest.FirstName,
                    LastName = RegisterRequest.LastName,
                    Email = RegisterRequest.Email,
                    Password = RegisterRequest.Password,
                    ConfirmPassword = RegisterRequest.ConfirmPassword,
                    Phone = RegisterRequest.Phone,
                    Address = RegisterRequest.Address
                };

                var response = await _authService.RegisterAsync(request);

                if (response != null)
                {
                    _logger.LogInformation("User {Email} registered successfully", RegisterRequest.Email);

                    TempData["Success"] = $"¡Bienvenido {response.User.FirstName}! Tu cuenta ha sido creada correctamente.";
                    return RedirectToPage("/Index");
                }
                else
                {
                    ModelState.AddModelError("", "Error al crear la cuenta. Por favor, inténtalo de nuevo.");
                    return Page();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed for user {Email}", RegisterRequest.Email);
                ModelState.AddModelError("", "Error al crear la cuenta. Por favor, inténtalo de nuevo.");
                return Page();
            }
        }
    }
}