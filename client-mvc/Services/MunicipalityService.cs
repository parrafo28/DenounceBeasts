using DenounceBeasts.WebClient.Models.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace DenounceBeasts.WebClient.Services;

public class MunicipalityService : IMunicipalityService
{
    private readonly IApiService _apiService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MunicipalityService> _logger;
    private const string CacheKeyPrefix = "municipalities";
    private const int CacheExpirationMinutes = 5;

    public MunicipalityService(IApiService apiService, IMemoryCache cache, ILogger<MunicipalityService> logger)
    {
        _apiService = apiService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Municipality>> GetAllAsync()
    {
        const string cacheKey = $"{CacheKeyPrefix}_all";
        
        if (_cache.TryGetValue(cacheKey, out IEnumerable<Municipality>? cachedMunicipalities))
        {
            _logger.LogInformation("Retrieved municipalities from cache");
            return cachedMunicipalities ?? new List<Municipality>();
        }

        try
        {
            var municipalities = await _apiService.GetAsync<IEnumerable<Municipality>>("api/municipalities");
            
            if (municipalities != null)
            {
                _cache.Set(cacheKey, municipalities, TimeSpan.FromMinutes(CacheExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} municipalities from API", municipalities.Count());
            }
            
            return municipalities ?? new List<Municipality>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving municipalities");
            return new List<Municipality>();
        }
    }

    public async Task<Municipality?> GetByIdAsync(int id)
    {
        const string cacheKey = $"{CacheKeyPrefix}_{id}";
        
        if (_cache.TryGetValue(cacheKey, out Municipality? cachedMunicipality))
        {
            _logger.LogInformation("Retrieved municipality {Id} from cache", id);
            return cachedMunicipality;
        }

        try
        {
            var municipality = await _apiService.GetAsync<Municipality>($"api/municipalities/{id}");
            
            if (municipality != null)
            {
                _cache.Set(cacheKey, municipality, TimeSpan.FromMinutes(CacheExpirationMinutes));
                _logger.LogInformation("Retrieved municipality {Id} from API", id);
            }
            
            return municipality;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving municipality {Id}", id);
            return null;
        }
    }

    public async Task<Municipality?> CreateAsync(Municipality municipality)
    {
        try
        {
            var createDto = new
            {
                Name = municipality.Name,
                Code = municipality.Code,
                IsActive = municipality.IsActive
            };

            var result = await _apiService.PostAsync<Municipality>("api/municipalities", createDto);
            
            if (result != null)
            {
                // Clear cache
                InvalidateCache();
                _logger.LogInformation("Created municipality {Name} with code {Code}", municipality.Name, municipality.Code);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating municipality {Name}", municipality.Name);
            return null;
        }
    }

    public async Task<Municipality?> UpdateAsync(int id, Municipality municipality)
    {
        try
        {
            var updateDto = new
            {
                Id = id,
                Name = municipality.Name,
                Code = municipality.Code,
                IsActive = municipality.IsActive
            };

            var result = await _apiService.PutAsync<Municipality>($"api/municipalities/{id}", updateDto);
            
            if (result != null)
            {
                // Clear cache
                InvalidateCache();
                _logger.LogInformation("Updated municipality {Id}", id);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating municipality {Id}", id);
            return null;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var result = await _apiService.DeleteAsync($"api/municipalities/{id}");
            
            if (result)
            {
                // Clear cache
                InvalidateCache();
                _logger.LogInformation("Deleted municipality {Id}", id);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting municipality {Id}", id);
            return false;
        }
    }

    public async Task<IEnumerable<Municipality>> SearchAsync(string query)
    {
        try
        {
            var municipalities = await GetAllAsync();
            
            if (string.IsNullOrWhiteSpace(query))
                return municipalities;

            var filtered = municipalities.Where(m => 
                m.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                m.Code.Contains(query, StringComparison.OrdinalIgnoreCase));

            _logger.LogInformation("Found {Count} municipalities matching query '{Query}'", filtered.Count(), query);
            return filtered;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching municipalities with query '{Query}'", query);
            return new List<Municipality>();
        }
    }

    public async Task<IEnumerable<Municipality>> GetActiveAsync()
    {
        try
        {
            var municipalities = await GetAllAsync();
            var active = municipalities.Where(m => m.IsActive);
            
            _logger.LogInformation("Retrieved {Count} active municipalities", active.Count());
            return active;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active municipalities");
            return new List<Municipality>();
        }
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        try
        {
            var municipalities = await GetAllAsync();
            var exists = municipalities.Any(m => 
                m.Code.Equals(code, StringComparison.OrdinalIgnoreCase) && 
                (excludeId == null || m.Id != excludeId));

            _logger.LogInformation("Code uniqueness check for '{Code}': {IsUnique}", code, !exists);
            return !exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking code uniqueness for '{Code}'", code);
            return false;
        }
    }

    public async Task<IEnumerable<Sector>> GetSectorsByMunicipalityAsync(int municipalityId)
    {
        try
        {
            var sectors = await _apiService.GetAsync<IEnumerable<Sector>>($"api/municipalities/{municipalityId}/sectors");
            
            if (sectors != null)
            {
                _logger.LogInformation("Retrieved {Count} sectors for municipality {MunicipalityId}", 
                    sectors.Count(), municipalityId);
            }
            
            return sectors ?? new List<Sector>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sectors for municipality {MunicipalityId}", municipalityId);
            return new List<Sector>();
        }
    }

    private void InvalidateCache()
    {
        // Remove all municipality-related cache entries
        var cacheKeys = new[]
        {
            $"{CacheKeyPrefix}_all"
        };

        foreach (var key in cacheKeys)
        {
            _cache.Remove(key);
        }

        _logger.LogInformation("Municipality cache invalidated");
    }
}