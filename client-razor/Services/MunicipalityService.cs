using client_razor.Models;

namespace client_razor.Services;

public interface IMunicipalityService : IApiService<MunicipalityDto, CreateMunicipalityDto, UpdateMunicipalityDto>
{
    Task<IEnumerable<MunicipalityDto>> GetActiveMunicipalitiesAsync();
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}

public class MunicipalityService : BaseApiService<MunicipalityDto, CreateMunicipalityDto, UpdateMunicipalityDto>, IMunicipalityService
{
    public MunicipalityService(HttpClient httpClient, ILogger<MunicipalityService> logger)
        : base(httpClient, logger, "api/municipalities")
    {
    }

    public async Task<IEnumerable<MunicipalityDto>> GetActiveMunicipalitiesAsync()
    {
        try
        {
            _logger.LogInformation("Fetching active municipalities");
            
            var allMunicipalities = await GetAllAsync();
            var activeMunicipalities = allMunicipalities.Where(m => m.IsActive);
            
            _logger.LogInformation("Successfully fetched {Count} active municipalities", activeMunicipalities.Count());
            return activeMunicipalities;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching active municipalities");
            throw;
        }
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        try
        {
            _logger.LogInformation("Checking if municipality code '{Code}' is unique (excluding ID: {ExcludeId})", code, excludeId);
            
            var municipalities = await GetAllAsync();
            var isDuplicate = municipalities.Any(m => 
                string.Equals(m.Code, code, StringComparison.OrdinalIgnoreCase) && 
                (excludeId == null || m.Id != excludeId));
            
            var isUnique = !isDuplicate;
            _logger.LogInformation("Municipality code '{Code}' is {Status}", code, isUnique ? "unique" : "not unique");
            
            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking municipality code uniqueness for '{Code}'", code);
            throw;
        }
    }
}