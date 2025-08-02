using ClientBlazor.Models;

namespace ClientBlazor.Services
{
    public interface IAuthService
    {
        event Action<AuthUser?> AuthStateChanged;
        
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        Task<AuthResponse?> RegisterAsync(RegisterRequest request);
        Task LogoutAsync();
        Task<AuthUser?> GetProfileAsync();
        Task<bool> ChangePasswordAsync(ChangePasswordRequest request);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<bool> ValidateTokenAsync();
        Task InitializeAsync();
        
        bool IsAuthenticated { get; }
        AuthUser? CurrentUser { get; }
        string? Token { get; }
    }
}