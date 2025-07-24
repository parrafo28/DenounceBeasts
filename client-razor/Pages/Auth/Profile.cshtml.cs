using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using client_razor.Services;
using client_razor.Models;

namespace client_razor.Pages.Auth
{
    public class ProfileModel : PageModel
    {
        private readonly IAuthService _authService;
        private readonly ILogger<ProfileModel> _logger;

        public ProfileModel(IAuthService authService, ILogger<ProfileModel> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        public AuthUser? User { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            if (!_authService.IsAuthenticated())
            {
                return RedirectToPage("/Auth/Login");
            }

            try
            {
                User = await _authService.GetProfileAsync();
                if (User == null)
                {
                    _logger.LogWarning("Failed to load user profile");
                    TempData["Error"] = "Error al cargar el perfil de usuario.";
                    return RedirectToPage("/Index");
                }

                return Page();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading user profile");
                TempData["Error"] = "Error al cargar el perfil de usuario.";
                return RedirectToPage("/Index");
            }
        }

        public async Task<IActionResult> OnPostLogoutAsync()
        {
            var currentUser = _authService.GetCurrentUser();
            if (currentUser != null)
            {
                _logger.LogInformation("User {UserId} logging out", currentUser.Id);
            }

            await _authService.LogoutAsync();
            
            TempData["Info"] = "Has cerrado sesión correctamente.";
            return RedirectToPage("/Index");
        }
    }
}