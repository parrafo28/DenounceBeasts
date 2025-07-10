using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface IDistrictService
    {
        Task<int> CreateDistrict(CreateDistrictDto request);
        Task DeleteDistrict(int id);
        Task<DistrictDto> GetDistrictById(int id);
        Task<List<DistrictDto>> GetDistricts();
        Task<List<DistrictDto>> GetDistrictsWithMunicipalities();
        Task UpdateDistrict(UpdateDistrictDto request);
    }
}