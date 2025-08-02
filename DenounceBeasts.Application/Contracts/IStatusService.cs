using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface IStatusService
    {
        Task<IEnumerable<StatusDto>> GetAllAsync();
        Task<StatusDto> GetByIdAsync(int id);
        Task<StatusDto> CreateAsync(StatusDto createDto);
        Task<StatusDto> UpdateAsync(StatusDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<StatusDto> GetByNameAsync(string name);
        Task<IEnumerable<StatusDto>> GetActiveAsync();
        Task<int> GetTotalCountAsync();
        Task<IEnumerable<StatusDto>> GetPagedAsync(int pageNumber, int pageSize);
    }
}