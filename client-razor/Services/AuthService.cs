using client_razor.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace client_razor.Services
{
    public class AuthService : IAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuthService> _logger;
        private const string TokenKey = "DenounceBeasts_Token";
        private const string UserKey = "DenounceBeasts_User";
        private const string ExpiryKey = "DenounceBeasts_TokenExpiry";

        public AuthService(
            HttpClient httpClient,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuthService> logger)
        {
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;

            // Set auth header if token exists
            var token = GetToken();
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new AuthenticationHeaderValue("Bearer", token);
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
                        SetAuthData(authResponse.Token, authResponse.User, authResponse.Expires);
                        
                        // Set authorization header for subsequent requests
                        _httpClient.DefaultRequestHeaders.Authorization = 
                            new AuthenticationHeaderValue("Bearer", authResponse.Token);
                        
                        _logger.LogInformation("Login successful for user: {UserId}", authResponse.User.Id);
                        return authResponse;
                    }
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Login failed for user: {Email}. Status: {StatusCode}, Content: {Content}", 
                    request.Email, response.StatusCode, errorContent);
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user: {Email}", request.Email);
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
                        SetAuthData(authResponse.Token, authResponse.User, authResponse.Expires);
                        
                        // Set authorization header for subsequent requests
                        _httpClient.DefaultRequestHeaders.Authorization = 
                            new AuthenticationHeaderValue("Bearer", authResponse.Token);
                        
                        _logger.LogInformation("Registration successful for user: {UserId}", authResponse.User.Id);
                        return authResponse;
                    }
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Registration failed for user: {Email}. Status: {StatusCode}, Content: {Content}", 
                    request.Email, response.StatusCode, errorContent);
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for user: {Email}", request.Email);
                throw;
            }
        }

        public Task LogoutAsync()
        {
            _logger.LogInformation("User logging out");
            
            ClearAuthData();
            
            // Clear authorization header
            _httpClient.DefaultRequestHeaders.Authorization = null;
            
            return Task.CompletedTask;
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
                        var httpContext = _httpContextAccessor.HttpContext;
                        if (httpContext != null)
                        {
                            var userJson = JsonSerializer.Serialize(user);
                            httpContext.Session.SetString(UserKey, userJson);
                        }
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
                    return true;
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Failed to change password. Status: {StatusCode}, Content: {Content}", 
                    response.StatusCode, errorContent);
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
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

        public bool IsAuthenticated()
        {
            var token = GetToken();
            var user = GetCurrentUser();
            
            if (string.IsNullOrEmpty(token) || user == null)
            {
                return false;
            }

            // Check if token is expired
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                var expiryStr = httpContext.Session.GetString(ExpiryKey);
                if (!string.IsNullOrEmpty(expiryStr) && DateTime.TryParse(expiryStr, out var expiry))
                {
                    if (expiry <= DateTime.UtcNow.AddMinutes(-5)) // 5 minute buffer
                    {
                        ClearAuthData();
                        return false;
                    }
                }
            }

            return true;
        }

        public AuthUser? GetCurrentUser()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return null;

            var userJson = httpContext.Session.GetString(UserKey);
            if (string.IsNullOrEmpty(userJson)) return null;

            try
            {
                return JsonSerializer.Deserialize<AuthUser>(userJson);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deserializing current user");
                return null;
            }
        }

        public string? GetToken()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            return httpContext?.Session.GetString(TokenKey);
        }

        public void SetAuthData(string token, AuthUser user, DateTime expiry)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            httpContext.Session.SetString(TokenKey, token);
            httpContext.Session.SetString(UserKey, JsonSerializer.Serialize(user));
            httpContext.Session.SetString(ExpiryKey, expiry.ToString("O"));
            
            _logger.LogInformation("Authentication data set for user: {UserId}", user.Id);
        }

        public void ClearAuthData()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            httpContext.Session.Remove(TokenKey);
            httpContext.Session.Remove(UserKey);
            httpContext.Session.Remove(ExpiryKey);
            
            _logger.LogInformation("Authentication data cleared");
        }
    }
}