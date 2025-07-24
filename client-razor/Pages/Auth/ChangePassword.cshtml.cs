using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using client_razor.Services;
using client_razor.Models;
using System.ComponentModel.DataAnnotations;

namespace client_razor.Pages.Auth
{
    public class ChangePasswordModel : PageModel
    {
        private readonly IAuthService _authService;
        private readonly ILogger<ChangePasswordModel> _logger;

        public ChangePasswordModel(IAuthService authService, ILogger<ChangePasswordModel> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [BindProperty]
        public ChangePasswordRequestModel PasswordRequest { get; set; } = new();

        public class ChangePasswordRequestModel
        {
            [Required(ErrorMessage = "La contraseña actual es requerida")]
            public string CurrentPassword { get; set; } = string.Empty;

            [Required(ErrorMessage = "La nueva contraseña es requerida")]
            [MinLength(6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres")]
            public string NewPassword { get; set; } = string.Empty;

            [Required(ErrorMessage = "Debes confirmar la nueva contraseña")]
            [Compare("NewPassword", ErrorMessage = "Las contraseñas no coinciden")]
            public string ConfirmNewPassword { get; set; } = string.Empty;
        }

        public IActionResult OnGet()
        {
            if (!_authService.IsAuthenticated())
            {
                return RedirectToPage("/Auth/Login");
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!_authService.IsAuthenticated())
            {
                return RedirectToPage("/Auth/Login");
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }

            // Additional validation: new password must be different from current
            if (PasswordRequest.CurrentPassword == PasswordRequest.NewPassword)
            {
                ModelState.AddModelError("PasswordRequest.NewPassword", "La nueva contraseña debe ser diferente a la actual");
                return Page();
            }

            try
            {
                var request = new client_razor.Models.ChangePasswordRequest
                {
                    CurrentPassword = PasswordRequest.CurrentPassword,
                    NewPassword = PasswordRequest.NewPassword,
                    ConfirmNewPassword = PasswordRequest.ConfirmNewPassword
                };

                var success = await _authService.ChangePasswordAsync(request);

                if (success)
                {
                    _logger.LogInformation("Password changed successfully for current user");
                    TempData["Success"] = "La contraseña ha sido cambiada correctamente.";
                    return RedirectToPage("/Auth/Profile");
                }
                else
                {
                    ModelState.AddModelError("", "Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.");
                    return Page();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                ModelState.AddModelError("", "Error al cambiar la contraseña. Por favor, inténtalo de nuevo.");
                return Page();
            }
        }
    }
}