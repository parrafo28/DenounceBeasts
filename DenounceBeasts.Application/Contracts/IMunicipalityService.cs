using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface IMunicipalityService
    {
        Task<int> CreateMunicipality(MunicipalityDto request);
        
    }
}