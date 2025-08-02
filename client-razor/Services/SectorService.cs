using client_razor.Models;

namespace client_razor.Services;

public interface ISectorService : IApiService<SectorDto, CreateSectorDto, UpdateSectorDto>
{
    Task<IEnumerable<SectorDto>> GetActiveSectorsAsync();
    Task<IEnumerable<SectorDto>> GetSectorsByMunicipalityAsync(int municipalityId);
    Task<bool> IsCodeUniqueInMunicipalityAsync(string code, int municipalityId, int? excludeId = null);
}

public class SectorService : BaseApiService<SectorDto, CreateSectorDto, UpdateSectorDto>, ISectorService
{
    private readonly IMunicipalityService _municipalityService;

    public SectorService(HttpClient httpClient, ILogger<SectorService> logger, IMunicipalityService municipalityService)
        : base(httpClient, logger, "api/sectors")
    {
        _municipalityService = municipalityService;
    }

    public override async Task<IEnumerable<SectorDto>> GetAllAsync()
    {
        try
        {
            var sectors = await base.GetAllAsync();
            var municipalities = await _municipalityService.GetAllAsync();
            
            // Enriquecer sectores con nombres de municipios
            var enrichedSectors = sectors.Select(sector =>
            {
                var municipality = municipalities.FirstOrDefault(m => m.Id == sector.MunicipalityId);
                sector.MunicipalityName = municipality?.Name ?? "N/A";
                return sector;
            });

            return enrichedSectors;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching sectors with municipality names");
            throw;
        }
    }

    public async Task<IEnumerable<SectorDto>> GetActiveSectorsAsync()
    {
        try
        {
            _logger.LogInformation("Fetching active sectors");
            
            var allSectors = await GetAllAsync();
            var activeSectors = allSectors.Where(s => s.IsActive);
            
            _logger.LogInformation("Successfully fetched {Count} active sectors", activeSectors.Count());
            return activeSectors;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching active sectors");
            throw;
        }
    }

    public async Task<IEnumerable<SectorDto>> GetSectorsByMunicipalityAsync(int municipalityId)
    {
        try
        {
            _logger.LogInformation("Fetching sectors for municipality ID: {MunicipalityId}", municipalityId);
            
            var allSectors = await GetAllAsync();
            var municipalitySectors = allSectors.Where(s => s.MunicipalityId == municipalityId);
            
            _logger.LogInformation("Successfully fetched {Count} sectors for municipality ID: {MunicipalityId}", 
                municipalitySectors.Count(), municipalityId);
            
            return municipalitySectors;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching sectors for municipality ID: {MunicipalityId}", municipalityId);
            throw;
        }
    }

    public async Task<bool> IsCodeUniqueInMunicipalityAsync(string code, int municipalityId, int? excludeId = null)
    {
        try
        {
            _logger.LogInformation("Checking if sector code '{Code}' is unique in municipality {MunicipalityId} (excluding ID: {ExcludeId})", 
                code, municipalityId, excludeId);
            
            var municipalitySectors = await GetSectorsByMunicipalityAsync(municipalityId);
            var isDuplicate = municipalitySectors.Any(s => 
                string.Equals(s.Code, code, StringComparison.OrdinalIgnoreCase) && 
                (excludeId == null || s.Id != excludeId));
            
            var isUnique = !isDuplicate;
            _logger.LogInformation("Sector code '{Code}' is {Status} in municipality {MunicipalityId}", 
                code, isUnique ? "unique" : "not unique", municipalityId);
            
            return isUnique;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking sector code uniqueness for '{Code}' in municipality {MunicipalityId}", 
                code, municipalityId);
            throw;
        }
    }
}