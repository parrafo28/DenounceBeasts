using System.Text;
using System.Text.Json;

namespace ClientBlazor.Services;

public abstract class BaseApiService<TEntity, TCreateDto, TUpdateDto> : IApiService<TEntity, TCreateDto, TUpdateDto>
    where TEntity : class
{
    protected readonly HttpClient _httpClient;
    protected readonly ILogger _logger;
    protected readonly string _endpoint;
    
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    protected BaseApiService(HttpClient httpClient, ILogger logger, string endpoint)
    {
        _httpClient = httpClient;
        _logger = logger;
        _endpoint = endpoint;
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Fetching all {EntityType}", typeof(TEntity).Name);
            
            var response = await _httpClient.GetAsync(_endpoint);
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            var entities = JsonSerializer.Deserialize<IEnumerable<TEntity>>(json, _jsonOptions);
            
            _logger.LogInformation("Successfully fetched {Count} {EntityType}", entities?.Count() ?? 0, typeof(TEntity).Name);
            return entities ?? Enumerable.Empty<TEntity>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all {EntityType}", typeof(TEntity).Name);
            throw;
        }
    }

    public virtual async Task<TEntity?> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Fetching {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            
            var response = await _httpClient.GetAsync($"{_endpoint}/{id}");
            
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;
                
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            var entity = JsonSerializer.Deserialize<TEntity>(json, _jsonOptions);
            
            _logger.LogInformation("Successfully fetched {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            return entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            throw;
        }
    }

    public virtual async Task<TEntity> CreateAsync(TCreateDto createDto)
    {
        try
        {
            _logger.LogInformation("Creating new {EntityType}", typeof(TEntity).Name);
            
            var json = JsonSerializer.Serialize(createDto, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync(_endpoint, content);
            response.EnsureSuccessStatusCode();
            
            var responseJson = await response.Content.ReadAsStringAsync();
            var entity = JsonSerializer.Deserialize<TEntity>(responseJson, _jsonOptions);
            
            _logger.LogInformation("Successfully created {EntityType}", typeof(TEntity).Name);
            return entity ?? throw new InvalidOperationException("Failed to deserialize created entity");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating {EntityType}", typeof(TEntity).Name);
            throw;
        }
    }

    public virtual async Task<TEntity> UpdateAsync(int id, TUpdateDto updateDto)
    {
        try
        {
            _logger.LogInformation("Updating {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            
            var json = JsonSerializer.Serialize(updateDto, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PutAsync($"{_endpoint}/{id}", content);
            response.EnsureSuccessStatusCode();
            
            var responseJson = await response.Content.ReadAsStringAsync();
            var entity = JsonSerializer.Deserialize<TEntity>(responseJson, _jsonOptions);
            
            _logger.LogInformation("Successfully updated {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            return entity ?? throw new InvalidOperationException("Failed to deserialize updated entity");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            throw;
        }
    }

    public virtual async Task<bool> DeleteAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            
            var response = await _httpClient.DeleteAsync($"{_endpoint}/{id}");
            
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return false;
                
            response.EnsureSuccessStatusCode();
            
            _logger.LogInformation("Successfully deleted {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting {EntityType} with ID: {Id}", typeof(TEntity).Name, id);
            throw;
        }
    }
}