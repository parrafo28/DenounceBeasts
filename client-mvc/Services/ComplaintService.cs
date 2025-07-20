using DenounceBeasts.WebClient.Models.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace DenounceBeasts.WebClient.Services;

public class ComplaintService : IComplaintService
{
    private readonly IApiService _apiService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ComplaintService> _logger;
    private const string CacheKeyPrefix = "complaints";
    private const int CacheExpirationMinutes = 2; // Shorter cache for dynamic content

    public ComplaintService(IApiService apiService, IMemoryCache cache, ILogger<ComplaintService> logger)
    {
        _apiService = apiService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Complaint>> GetAllAsync()
    {
        const string cacheKey = $"{CacheKeyPrefix}_all";
        
        if (_cache.TryGetValue(cacheKey, out IEnumerable<Complaint>? cachedComplaints))
        {
            _logger.LogInformation("Retrieved complaints from cache");
            return cachedComplaints ?? new List<Complaint>();
        }

        try
        {
            var complaints = await _apiService.GetAsync<IEnumerable<Complaint>>("api/complaints");
            
            if (complaints != null)
            {
                _cache.Set(cacheKey, complaints, TimeSpan.FromMinutes(CacheExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} complaints from API", complaints.Count());
            }
            
            return complaints ?? new List<Complaint>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaints");
            return new List<Complaint>();
        }
    }

    public async Task<Complaint?> GetByIdAsync(int id)
    {
        try
        {
            var complaint = await _apiService.GetAsync<Complaint>($"api/complaints/{id}");
            _logger.LogInformation("Retrieved complaint {Id}", id);
            return complaint;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaint {Id}", id);
            return null;
        }
    }

    public async Task<Complaint?> CreateAsync(Complaint complaint)
    {
        try
        {
            var createDto = new
            {
                Title = complaint.Title,
                Description = complaint.Description,
                Address = complaint.Address,
                Latitude = complaint.Latitude,
                Longitude = complaint.Longitude,
                Priority = complaint.Priority,
                ComplaintTypeId = complaint.ComplaintTypeId,
                MunicipalityId = complaint.MunicipalityId,
                SectorId = complaint.SectorId,
                UserId = complaint.UserId
            };

            var result = await _apiService.PostAsync<Complaint>("api/complaints", createDto);
            
            if (result != null)
            {
                InvalidateCache();
                _logger.LogInformation("Created complaint '{Title}'", complaint.Title);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating complaint '{Title}'", complaint.Title);
            return null;
        }
    }

    public async Task<Complaint?> UpdateAsync(int id, Complaint complaint)
    {
        try
        {
            var updateDto = new
            {
                Id = id,
                Title = complaint.Title,
                Description = complaint.Description,
                Address = complaint.Address,
                Latitude = complaint.Latitude,
                Longitude = complaint.Longitude,
                Priority = complaint.Priority,
                ComplaintTypeId = complaint.ComplaintTypeId,
                StatusId = complaint.StatusId,
                MunicipalityId = complaint.MunicipalityId,
                SectorId = complaint.SectorId,
                UserId = complaint.UserId
            };

            var result = await _apiService.PutAsync<Complaint>($"api/complaints/{id}", updateDto);
            
            if (result != null)
            {
                InvalidateCache();
                _logger.LogInformation("Updated complaint {Id}", id);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating complaint {Id}", id);
            return null;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var result = await _apiService.DeleteAsync($"api/complaints/{id}");
            
            if (result)
            {
                InvalidateCache();
                _logger.LogInformation("Deleted complaint {Id}", id);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting complaint {Id}", id);
            return false;
        }
    }

    public async Task<IEnumerable<Complaint>> SearchAsync(string? query = null, int? municipalityId = null, 
        int? complaintTypeId = null, int? statusId = null, Priority? priority = null)
    {
        try
        {
            var complaints = await GetAllAsync();
            
            if (!string.IsNullOrWhiteSpace(query))
            {
                complaints = complaints.Where(c => 
                    c.Title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                    c.Description.Contains(query, StringComparison.OrdinalIgnoreCase));
            }

            if (municipalityId.HasValue)
            {
                complaints = complaints.Where(c => c.MunicipalityId == municipalityId.Value);
            }

            if (complaintTypeId.HasValue)
            {
                complaints = complaints.Where(c => c.ComplaintTypeId == complaintTypeId.Value);
            }

            if (statusId.HasValue)
            {
                complaints = complaints.Where(c => c.StatusId == statusId.Value);
            }

            if (priority.HasValue)
            {
                complaints = complaints.Where(c => c.Priority == priority.Value);
            }

            var result = complaints.ToList();
            _logger.LogInformation("Found {Count} complaints matching search criteria", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching complaints");
            return new List<Complaint>();
        }
    }

    public async Task<IEnumerable<Complaint>> GetByMunicipalityAsync(int municipalityId)
    {
        try
        {
            var complaints = await GetAllAsync();
            var filtered = complaints.Where(c => c.MunicipalityId == municipalityId);
            
            _logger.LogInformation("Retrieved {Count} complaints for municipality {MunicipalityId}", 
                filtered.Count(), municipalityId);
            return filtered;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaints for municipality {MunicipalityId}", municipalityId);
            return new List<Complaint>();
        }
    }

    public async Task<IEnumerable<Complaint>> GetBySectorAsync(int sectorId)
    {
        try
        {
            var complaints = await GetAllAsync();
            var filtered = complaints.Where(c => c.SectorId == sectorId);
            
            _logger.LogInformation("Retrieved {Count} complaints for sector {SectorId}", 
                filtered.Count(), sectorId);
            return filtered;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaints for sector {SectorId}", sectorId);
            return new List<Complaint>();
        }
    }

    public async Task<IEnumerable<Complaint>> GetByComplaintTypeAsync(int complaintTypeId)
    {
        try
        {
            var complaints = await GetAllAsync();
            var filtered = complaints.Where(c => c.ComplaintTypeId == complaintTypeId);
            
            _logger.LogInformation("Retrieved {Count} complaints for complaint type {ComplaintTypeId}", 
                filtered.Count(), complaintTypeId);
            return filtered;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaints for complaint type {ComplaintTypeId}", complaintTypeId);
            return new List<Complaint>();
        }
    }

    public async Task<IEnumerable<Complaint>> GetByStatusAsync(int statusId)
    {
        try
        {
            var complaints = await GetAllAsync();
            var filtered = complaints.Where(c => c.StatusId == statusId);
            
            _logger.LogInformation("Retrieved {Count} complaints for status {StatusId}", 
                filtered.Count(), statusId);
            return filtered;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving complaints for status {StatusId}", statusId);
            return new List<Complaint>();
        }
    }

    private void InvalidateCache()
    {
        var cacheKeys = new[]
        {
            $"{CacheKeyPrefix}_all"
        };

        foreach (var key in cacheKeys)
        {
            _cache.Remove(key);
        }

        _logger.LogInformation("Complaint cache invalidated");
    }
}