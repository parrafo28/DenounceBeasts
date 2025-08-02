using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Application.Contracts
{
    public interface IComplaintService
    {
        Task<IEnumerable<ComplaintDto>> GetAllAsync();
        Task<ComplaintDto> GetByIdAsync(int id);
        Task<ComplaintDto> CreateAsync(CreateComplaintDto createDto);
        Task<ComplaintDto> UpdateAsync(UpdateComplaintDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<ComplaintDto>> GetByUserIdAsync(int userId);
        Task<IEnumerable<ComplaintDto>> GetByStatusIdAsync(int statusId);
        Task<IEnumerable<ComplaintDto>> GetByComplaintTypeIdAsync(int complaintTypeId);
        Task<IEnumerable<ComplaintDto>> GetBySectorIdAsync(int sectorId);
        Task<IEnumerable<ComplaintDto>> GetByLocationAsync(double latitude, double longitude, double radiusKm);
        Task<bool> UpdateStatusAsync(int complaintId, int statusId, string comments, int? userId = null);
        Task<int> GetTotalCountAsync();
        Task<IEnumerable<ComplaintDto>> GetPagedAsync(int pageNumber, int pageSize);
        Task<IEnumerable<ComplaintDto>> SearchAsync(string searchTerm);
    }
}