using DenounceBeasts.WebClient.Models.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace DenounceBeasts.WebClient.Services;

public class StatusService : IStatusService
{
    private readonly IApiService _apiService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<StatusService> _logger;
    private const string CacheKeyPrefix = "statuses";
    private const int CacheExpirationMinutes = 10;

    public StatusService(IApiService apiService, IMemoryCache cache, ILogger<StatusService> logger)
    {
        _apiService = apiService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Status>> GetAllAsync()
    {
        const string cacheKey = $"{CacheKeyPrefix}_all";
        
        if (_cache.TryGetValue(cacheKey, out IEnumerable<Status>? cachedStatuses))
        {
            _logger.LogInformation("Retrieved statuses from cache");
            return cachedStatuses ?? new List<Status>();
        }

        try
        {
            var statuses = await _apiService.GetAsync<IEnumerable<Status>>("api/status");
            
            if (statuses != null)
            {
                _cache.Set(cacheKey, statuses, TimeSpan.FromMinutes(CacheExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} statuses from API", statuses.Count());
            }
            
            return statuses ?? new List<Status>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statuses");
            return new List<Status>();
        }
    }

    public async Task<Status?> GetByIdAsync(int id)
    {
        try
        {
            var status = await _apiService.GetAsync<Status>($"api/status/{id}");
            _logger.LogInformation("Retrieved status {Id}", id);
            return status;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving status {Id}", id);
            return null;
        }
    }

    public async Task<IEnumerable<Status>> GetActiveAsync()
    {
        try
        {
            var statuses = await GetAllAsync();
            var active = statuses.Where(s => s.IsActive);
            
            _logger.LogInformation("Retrieved {Count} active statuses", active.Count());
            return active;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active statuses");
            return new List<Status>();
        }
    }
}