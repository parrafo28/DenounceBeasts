using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Infrastructure.Contracts
{
    public interface ISectorRepository : IRepository<Sector>
    {
        Task<List<Sector>> GetAllSectorsActiveAsync();
        Task<List<Sector>> GetSectorsByMunicipalityId(int municipalityId);
        Task<List<Sector>> GetSectorWithTheirMunicipalityAsync();
    }
}