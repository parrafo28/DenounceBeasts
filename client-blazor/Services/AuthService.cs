using Blazored.LocalStorage;
using Blazored.Toast.Services;
using ClientBlazor.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ClientBlazor.Services
{
    public class AuthService : IAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly ILocalStorageService _localStorage;
        private readonly IToastService _toastService;
        private readonly ILogger<AuthService> _logger;
        
        private const string TokenKey = "denouncebeasts_token";
        private const string UserKey = "denouncebeasts_user";
        private const string ExpiryKey = "denouncebeasts_token_expiry";

        public AuthService(
            HttpClient httpClient,
            ILocalStorageService localStorage,
            IToastService toastService,
            ILogger<AuthService> logger)
        {
            _httpClient = httpClient;
            _localStorage = localStorage;
            _toastService = toastService;
            _logger = logger;
        }

        public event Action<AuthUser?> AuthStateChanged = delegate { };

        public bool IsAuthenticated { get; private set; }
        public AuthUser? CurrentUser { get; private set; }
        public string? Token { get; private set; }

        public async Task InitializeAsync()
        {
            try
            {
                Token = await _localStorage.GetItemAsync<string>(TokenKey);
                CurrentUser = await _localStorage.GetItemAsync<AuthUser>(UserKey);
                
                if (!string.IsNullOrEmpty(Token) && CurrentUser != null)
                {
                    // Check if token is expired
                    var expiryStr = await _localStorage.GetItemAsync<string>(ExpiryKey);
                    if (!string.IsNullOrEmpty(expiryStr) && DateTime.TryParse(expiryStr, out var expiry))
                    {
                        if (expiry <= DateTime.UtcNow.AddMinutes(-5)) // 5 minute buffer
                        {
                            await ClearAuthDataAsync();
                            return;
                        }
                    }

                    SetAuthHeader(Token);
                    IsAuthenticated = true;
                }
                else
                {
                    await ClearAuthDataAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing auth service");
                await ClearAuthDataAsync();
            }
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Attempting login for user: {Email}", request.Email);

                var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("api/auth/login", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var authResponse = JsonSerializer.Deserialize<AuthResponse>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    if (authResponse != null)
                    {
                        await SetAuthDataAsync(authResponse.Token, authResponse.User, authResponse.Expires);
                        SetAuthHeader(authResponse.Token);
                        
                        _logger.LogInformation("Login successful for user: {UserId}", authResponse.User.Id);
                        _toastService.ShowSuccess($"¡Bienvenido {authResponse.User.FirstName}!");
                        
                        return authResponse;
                    }
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Login failed for user: {Email}. Status: {StatusCode}, Content: {Content}", 
                    request.Email, response.StatusCode, errorContent);
                
                _toastService.ShowError("Email o contraseña incorrectos");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user: {Email}", request.Email);
                _toastService.ShowError("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
                throw;
            }
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            try
            {
                _logger.LogInformation("Attempting registration for user: {Email}", request.Email);

                var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("api/auth/register", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var authResponse = JsonSerializer.Deserialize<AuthResponse>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    if (authResponse != null)
                    {
                        await SetAuthDataAsync(authResponse.Token, authResponse.User, authResponse.Expires);
                        SetAuthHeader(authResponse.Token);
                        
                        _logger.LogInformation("Registration successful for user: {UserId}", authResponse.User.Id);
                        _toastService.ShowSuccess($"¡Bienvenido {authResponse.User.FirstName}! Tu cuenta ha sido creada correctamente.");
                        
                        return authResponse;
                    }
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Registration failed for user: {Email}. Status: {StatusCode}, Content: {Content}", 
                    request.Email, response.StatusCode, errorContent);
                
                _toastService.ShowError("Error al crear la cuenta. Verifica que el email no esté en uso.");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for user: {Email}", request.Email);
                _toastService.ShowError("Error al crear la cuenta. Por favor, inténtalo de nuevo.");
                throw;
            }
        }

        public async Task LogoutAsync()
        {
            _logger.LogInformation("User logging out");
            
            await ClearAuthDataAsync();
            ClearAuthHeader();
            
            _toastService.ShowInfo("Has cerrado sesión correctamente");
        }

        public async Task<AuthUser?> GetProfileAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("api/auth/profile");
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var user = JsonSerializer.Deserialize<AuthUser>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    if (user != null)
                    {
                        // Update stored user info
                        await _localStorage.SetItemAsync(UserKey, user);
                        CurrentUser = user;
                        AuthStateChanged.Invoke(CurrentUser);
                    }

                    return user;
                }

                _logger.LogWarning("Failed to get user profile. Status: {StatusCode}", response.StatusCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return null;
            }
        }

        public async Task<bool> ChangePasswordAsync(ChangePasswordRequest request)
        {
            try
            {
                var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("api/auth/change-password", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Password changed successfully");
                    _toastService.ShowSuccess("Contraseña cambiada correctamente");
                    return true;
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Failed to change password. Status: {StatusCode}, Content: {Content}", 
                    response.StatusCode, errorContent);
                
                _toastService.ShowError("Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                _toastService.ShowError("Error al cambiar la contraseña. Por favor, inténtalo de nuevo.");
                return false;
            }
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            try
            {
                var response = await _httpClient.GetAsync($"api/auth/check-email?email={Uri.EscapeDataString(email)}");
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<Dictionary<string, bool>>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    return result != null && !result.GetValueOrDefault("exists", true);
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email availability for: {Email}", email);
                return false;
            }
        }

        public async Task<bool> ValidateTokenAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("api/auth/verify-token");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating token");
                return false;
            }
        }

        private async Task SetAuthDataAsync(string token, AuthUser user, DateTime expiry)
        {
            Token = token;
            CurrentUser = user;
            IsAuthenticated = true;

            await _localStorage.SetItemAsync(TokenKey, token);
            await _localStorage.SetItemAsync(UserKey, user);
            await _localStorage.SetItemAsync(ExpiryKey, expiry.ToString("O"));
            
            AuthStateChanged.Invoke(CurrentUser);
            _logger.LogInformation("Authentication data set for user: {UserId}", user.Id);
        }

        private async Task ClearAuthDataAsync()
        {
            Token = null;
            CurrentUser = null;
            IsAuthenticated = false;

            await _localStorage.RemoveItemAsync(TokenKey);
            await _localStorage.RemoveItemAsync(UserKey);
            await _localStorage.RemoveItemAsync(ExpiryKey);
            
            AuthStateChanged.Invoke(null);
            _logger.LogInformation("Authentication data cleared");
        }

        private void SetAuthHeader(string token)
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", token);
        }

        private void ClearAuthHeader()
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
        }

        // Authorization methods
        public bool HasRole(string role)
        {
            return CurrentUser?.Roles?.Contains(role) ?? false;
        }

        public bool IsAdmin()
        {
            return HasRole("Admin");
        }

        public bool IsStaff()
        {
            return HasRole("Staff");
        }

        public bool IsUser()
        {
            return HasRole("User");
        }

        public bool IsAdminOrStaff()
        {
            return IsAdmin() || IsStaff();
        }

        public bool CanManageMunicipalities()
        {
            return IsAdmin(); // Solo admins pueden gestionar municipios
        }

        public bool CanManageSectors()
        {
            return IsAdmin(); // Solo admins pueden gestionar sectores
        }

        public bool CanManageComplaintTypes()
        {
            return IsAdmin(); // Solo admins pueden gestionar tipos de denuncia
        }

        public bool CanManageStatus()
        {
            return IsAdmin(); // Solo admins pueden gestionar estados
        }

        public bool CanViewReports()
        {
            return IsAdminOrStaff(); // Admins y staff pueden ver reportes
        }

        public bool CanModerateComplaints()
        {
            return IsAdminOrStaff(); // Admins y staff pueden moderar denuncias
        }
    }
}