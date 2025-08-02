using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Infrastructure.Contracts
{
    public interface IMunicipalityRepository: IRepository<Municipality>
    {
        Task<List<Municipality>> GetAllMunicipalitiesWithSectorsAsync();
        Task<Municipality?> GetMunicipalityWithSectorsByIdAsync(int id);
    }
}