using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Domain.Contracts.Repositories
{
    public interface IMunicipaltyRepository : IRepository<Municipality>
    {
        Task<List<Municipality>> GetMunicipaltiesWithDistricts();
    }
}
