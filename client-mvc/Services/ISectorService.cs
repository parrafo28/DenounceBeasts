using DenounceBeasts.WebClient.Models.Domain;

namespace DenounceBeasts.WebClient.Services;

public interface ISectorService
{
    Task<IEnumerable<Sector>> GetAllAsync();
    Task<Sector?> GetByIdAsync(int id);
    Task<Sector?> CreateAsync(Sector sector);
    Task<Sector?> UpdateAsync(int id, Sector sector);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Sector>> SearchAsync(string query, int? municipalityId = null);
    Task<IEnumerable<Sector>> GetActiveAsync();
    Task<IEnumerable<Sector>> GetByMunicipalityAsync(int municipalityId);
    Task<IEnumerable<Sector>> GetActiveByMunicipalityAsync(int municipalityId);
    Task<bool> IsCodeUniqueInMunicipalityAsync(string code, int municipalityId, int? excludeId = null);
}