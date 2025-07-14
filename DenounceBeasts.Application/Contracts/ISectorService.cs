using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface ISectorService
    {
        Task<int> CreateSector(CreateSectorDto request);
        Task DeleteSector(int id);
        Task<SectorDto> GetSector(int id);
        Task<List<SectorDto>> GetSectors();
        Task<List<SectorDto>> GetSectorsByMunicipality(int municipalityId);
        Task<List<SectorDto>> GetSectorsWithMunicipality();
        Task UpdateSector(int id, UpdateSectorDto request);
    }
}