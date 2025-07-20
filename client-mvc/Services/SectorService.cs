using DenounceBeasts.WebClient.Models.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace DenounceBeasts.WebClient.Services;

public class SectorService : ISectorService
{
    private readonly IApiService _apiService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<SectorService> _logger;
    private const string CacheKeyPrefix = "sectors";
    private const int CacheExpirationMinutes = 5;

    public SectorService(IApiService apiService, IMemoryCache cache, ILogger<SectorService> logger)
    {
        _apiService = apiService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Sector>> GetAllAsync()
    {
        const string cacheKey = $"{CacheKeyPrefix}_all";
        
        if (_cache.TryGetValue(cacheKey, out IEnumerable<Sector>? cachedSectors))
        {
            _logger.LogInformation("Retrieved sectors from cache");
            return cachedSectors ?? new List<Sector>();
        }

        try
        {
            var sectors = await _apiService.GetAsync<IEnumerable<Sector>>("api/sectors");
            
            if (sectors != null)
            {
                _cache.Set(cacheKey, sectors, TimeSpan.FromMinutes(CacheExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} sectors from API", sectors.Count());
            }
            
            return sectors ?? new List<Sector>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sectors");
            return new List<Sector>();
        }
    }

    public async Task<Sector?> GetByIdAsync(int id)
    {
        const string cacheKey = $"{CacheKeyPrefix}_{id}";
        
        if (_cache.TryGetValue(cacheKey, out Sector? cachedSector))
        {
            _logger.LogInformation("Retrieved sector {Id} from cache", id);
            return cachedSector;
        }

        try
        {
            var sector = await _apiService.GetAsync<Sector>($"api/sectors/{id}");
            
            if (sector != null)
            {
                _cache.Set(cacheKey, sector, TimeSpan.FromMinutes(CacheExpirationMinutes));
                _logger.LogInformation("Retrieved sector {Id} from API", id);
            }
            
            return sector;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sector {Id}", id);
            return null;
        }
    }

    public async Task<Sector?> CreateAsync(Sector sector)
    {
        try
        {
            var createDto = new
            {
                Name = sector.Name,
                Code = sector.Code,
                MunicipalityId = sector.MunicipalityId,
                IsActive = sector.IsActive
            };

            var result = await _apiService.PostAsync<Sector>("api/sectors", createDto);
            
            if (result != null)
            {
                // Clear cache
                InvalidateCache();
                _logger.LogInformation("Created sector {Name} with code {Code} in municipality {MunicipalityId}", 
                    sector.Name, sector.Code, sector.MunicipalityId);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sector {Name}", sector.Name);
            return null;
        }
    }

    public async Task<Sector?> UpdateAsync(int id, Sector sector)
    {
        try
        {
            var updateDto = new
            {
                Id = id,
                Name = sector.Name,
                Code = sector.Code,
                MunicipalityId = sector.MunicipalityId,
                IsActive = sector.IsActive
            };

            var result = await _apiService.PutAsync<Sector>($"api/sectors/{id}", updateDto);
            
            if (result != null)
            {
                // Clear cache
                InvalidateCache();
                _logger.LogInformation("Updated sector {Id}", id);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sector {Id}", id);
            return null;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var result = await _apiService.DeleteAsync($"api/sectors/{id}");
            
            if (result)
            {
                // Clear cache
                InvalidateCache();
                _logger.LogInformation("Deleted sector {Id}", id);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting sector {Id}", id);
            return false;
        }
    }

    public async Task<IEnumerable<Sector>> SearchAsync(string query, int? municipalityId = null)
    {
        try
        {
            var sectors = await GetAllAsync();
            
            if (!string.IsNullOrWhiteSpace(query))
            {
                sectors = sectors.Where(s => 
                    s.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                    s.Code.Contains(query, StringComparison.OrdinalIgnoreCase));
            }

            if (municipalityId.HasValue)
            {
                sectors = sectors.Where(s => s.MunicipalityId == municipalityId.Value);
            }

            var result = sectors.ToList();
            _logger.LogInformation("Found {Count} sectors matching search criteria", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching sectors");
            return new List<Sector>();
        }
    }

    public async Task<IEnumerable<Sector>> GetActiveAsync()
    {
        try
        {
            var sectors = await GetAllAsync();
            var active = sectors.Where(s => s.IsActive);
            
            _logger.LogInformation("Retrieved {Count} active sectors", active.Count());
            return active;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active sectors");
            return new List<Sector>();
        }
    }

    public async Task<IEnumerable<Sector>> GetByMunicipalityAsync(int municipalityId)
    {
        try
        {
            var sectors = await GetAllAsync();
            var filtered = sectors.Where(s => s.MunicipalityId == municipalityId);
            
            _logger.LogInformation("Retrieved {Count} sectors for municipality {MunicipalityId}", 
                filtered.Count(), municipalityId);
            return filtered;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sectors for municipality {MunicipalityId}", municipalityId);
            return new List<Sector>();
        }
    }

    public async Task<IEnumerable<Sector>> GetActiveByMunicipalityAsync(int municipalityId)
    {
        try
        {
            var sectors = await GetByMunicipalityAsync(municipalityId);
            var active = sectors.Where(s => s.IsActive);
            
            _logger.LogInformation("Retrieved {Count} active sectors for municipality {MunicipalityId}", 
                active.Count(), municipalityId);
            return active;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active sectors for municipality {MunicipalityId}", municipalityId);
            return new List<Sector>();
        }
    }

    public async Task<bool> IsCodeUniqueInMunicipalityAsync(string code, int municipalityId, int? excludeId = null)
    {
        try
        {
            var sectors = await GetByMunicipalityAsync(municipalityId);
            var exists = sectors.Any(s => 
                s.Code.Equals(code, StringComparison.OrdinalIgnoreCase) && 
                (excludeId == null || s.Id != excludeId));

            _logger.LogInformation("Code uniqueness check for '{Code}' in municipality {MunicipalityId}: {IsUnique}", 
                code, municipalityId, !exists);
            return !exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking code uniqueness for '{Code}' in municipality {MunicipalityId}", 
                code, municipalityId);
            return false;
        }
    }

    private void InvalidateCache()
    {
        // Remove all sector-related cache entries
        var cacheKeys = new[]
        {
            $"{CacheKeyPrefix}_all"
        };

        foreach (var key in cacheKeys)
        {
            _cache.Remove(key);
        }

        _logger.LogInformation("Sector cache invalidated");
    }
}