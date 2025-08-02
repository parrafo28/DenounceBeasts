using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface IComplaintTypeService
    {
        Task<IEnumerable<ComplaintTypeDto>> GetAllAsync();
        Task<ComplaintTypeDto> GetByIdAsync(int id);
        Task<ComplaintTypeDto> CreateAsync(ComplaintTypeDto createDto);
        Task<ComplaintTypeDto> UpdateAsync(ComplaintTypeDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<ComplaintTypeDto> GetByNameAsync(string name);
        Task<IEnumerable<ComplaintTypeDto>> GetActiveAsync();
        Task<int> GetTotalCountAsync();
        Task<IEnumerable<ComplaintTypeDto>> GetPagedAsync(int pageNumber, int pageSize);
    }
}