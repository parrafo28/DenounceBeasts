using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Domain.Contracts.Repositories
{
    public interface IDistrictRepository : IRepository<District>
    {
        Task<List<District>> GetDistrictsWithMunicipalties();
        Task<List<District>> GetDistrictsByMunicipalityId(int municipalityId);
    }
}
