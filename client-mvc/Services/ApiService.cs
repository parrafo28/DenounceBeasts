using Newtonsoft.Json;
using System.Text;

namespace DenounceBeasts.WebClient.Services;

public class ApiService : IApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ApiService> _logger;

    public ApiService(HttpClient httpClient, ILogger<ApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        try
        {
            _logger.LogInformation("GET request to {Endpoint}", endpoint);
            
            var response = await _httpClient.GetAsync(endpoint);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<T>(content);
                
                _logger.LogInformation("GET request to {Endpoint} completed successfully", endpoint);
                return result;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("GET request to {Endpoint} failed with status {StatusCode}: {ErrorContent}", 
                    endpoint, response.StatusCode, errorContent);
                return default;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during GET request to {Endpoint}", endpoint);
            return default;
        }
    }

    public async Task<T?> PostAsync<T>(string endpoint, object data)
    {
        return await PostAsync<object, T>(endpoint, data);
    }

    public async Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data)
    {
        try
        {
            _logger.LogInformation("POST request to {Endpoint}", endpoint);
            
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync(endpoint, content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<TResponse>(responseContent);
                
                _logger.LogInformation("POST request to {Endpoint} completed successfully", endpoint);
                return result;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("POST request to {Endpoint} failed with status {StatusCode}: {ErrorContent}", 
                    endpoint, response.StatusCode, errorContent);
                return default;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during POST request to {Endpoint}", endpoint);
            return default;
        }
    }

    public async Task<T?> PutAsync<T>(string endpoint, object data)
    {
        return await PutAsync<object, T>(endpoint, data);
    }

    public async Task<TResponse?> PutAsync<TRequest, TResponse>(string endpoint, TRequest data)
    {
        try
        {
            _logger.LogInformation("PUT request to {Endpoint}", endpoint);
            
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PutAsync(endpoint, content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<TResponse>(responseContent);
                
                _logger.LogInformation("PUT request to {Endpoint} completed successfully", endpoint);
                return result;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("PUT request to {Endpoint} failed with status {StatusCode}: {ErrorContent}", 
                    endpoint, response.StatusCode, errorContent);
                return default;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during PUT request to {Endpoint}", endpoint);
            return default;
        }
    }

    public async Task<bool> DeleteAsync(string endpoint)
    {
        try
        {
            _logger.LogInformation("DELETE request to {Endpoint}", endpoint);
            
            var response = await _httpClient.DeleteAsync(endpoint);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("DELETE request to {Endpoint} completed successfully", endpoint);
                return true;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("DELETE request to {Endpoint} failed with status {StatusCode}: {ErrorContent}", 
                    endpoint, response.StatusCode, errorContent);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during DELETE request to {Endpoint}", endpoint);
            return false;
        }
    }
}