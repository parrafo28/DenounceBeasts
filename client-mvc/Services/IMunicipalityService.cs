using DenounceBeasts.WebClient.Models.Domain;

namespace DenounceBeasts.WebClient.Services;

public interface IMunicipalityService
{
    Task<IEnumerable<Municipality>> GetAllAsync();
    Task<Municipality?> GetByIdAsync(int id);
    Task<Municipality?> CreateAsync(Municipality municipality);
    Task<Municipality?> UpdateAsync(int id, Municipality municipality);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Municipality>> SearchAsync(string query);
    Task<IEnumerable<Municipality>> GetActiveAsync();
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
    Task<IEnumerable<Sector>> GetSectorsByMunicipalityAsync(int municipalityId);
}