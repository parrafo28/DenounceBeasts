using DenounceBeasts.WebClient.Models.Domain;

namespace DenounceBeasts.WebClient.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task LogoutAsync();
    Task<AuthUser?> GetProfileAsync();
    Task<bool> ChangePasswordAsync(ChangePasswordRequest request);
    Task<bool> IsEmailAvailableAsync(string email);
    Task<bool> ValidateTokenAsync();
    bool IsAuthenticated();
    AuthUser? GetCurrentUser();
    string? GetToken();
    void SetAuthenticationData(string token, AuthUser user, DateTime expiry);
    void ClearAuthenticationData();
    
    // Authorization methods
    bool HasRole(string role);
    bool IsAdmin();
    bool IsStaff();
    bool IsUser();
    bool IsAdminOrStaff();
    bool CanManageMunicipalities();
    bool CanManageSectors();
    bool CanManageComplaintTypes();
    bool CanManageStatus();
    bool CanViewReports();
    bool CanModerateComplaints();
}