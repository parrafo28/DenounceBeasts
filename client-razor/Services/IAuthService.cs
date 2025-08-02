using client_razor.Models;

namespace client_razor.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        Task<AuthResponse?> RegisterAsync(RegisterRequest request);
        Task LogoutAsync();
        Task<AuthUser?> GetProfileAsync();
        Task<bool> ChangePasswordAsync(ChangePasswordRequest request);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<bool> ValidateTokenAsync();
        bool IsAuthenticated();
        AuthUser? GetCurrentUser();
        string? GetToken();
        void SetAuthData(string token, AuthUser user, DateTime expiry);
        void ClearAuthData();
    }
}