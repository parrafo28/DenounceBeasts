using DenounceBeasts.WebClient.Models.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace DenounceBeasts.WebClient.Services;

public class ComplaintTypeService : IComplaintTypeService
{
    private readonly IApiService _apiService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ComplaintTypeService> _logger;
    private const string CacheKeyPrefix = "complaint-types";
    private const int CacheExpirationMinutes = 10;

    public ComplaintTypeService(IApiService apiService, IMemoryCache cache, ILogger<ComplaintTypeService> logger)
    {
        _apiService = apiService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<ComplaintType>> GetAllAsync()
    {
        const string cacheKey = $"{CacheKeyPrefix}_all";
        
        if (_cache.TryGetValue(cacheKey, out IEnumerable<ComplaintType>? cachedTypes))
        {
            _logger.LogInformation("Retrieved complaint types from cache");
            return cachedTypes ?? new List<ComplaintType>();
        }

        try
        {
            var complaintTypes = await _apiService.GetAsync<IEnumerable<ComplaintType>>("api/complainttypes");
            
            if (complaintTypes != null)
            {
                _cache.Set(cacheKey, complaintTypes, TimeSpan.FromMinutes(CacheExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} complaint types from API", complaintTypes.Count());
            }
            
            return complaintTypes ?? new List<ComplaintType>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaint types");
            return new List<ComplaintType>();
        }
    }

    public async Task<ComplaintType?> GetByIdAsync(int id)
    {
        try
        {
            var complaintType = await _apiService.GetAsync<ComplaintType>($"api/complainttypes/{id}");
            _logger.LogInformation("Retrieved complaint type {Id}", id);
            return complaintType;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaint type {Id}", id);
            return null;
        }
    }

    public async Task<IEnumerable<ComplaintType>> GetActiveAsync()
    {
        try
        {
            var complaintTypes = await GetAllAsync();
            var active = complaintTypes.Where(ct => ct.IsActive);
            
            _logger.LogInformation("Retrieved {Count} active complaint types", active.Count());
            return active;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active complaint types");
            return new List<ComplaintType>();
        }
    }
}