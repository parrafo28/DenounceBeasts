using DenounceBeasts.WebClient.Models.Domain;

namespace DenounceBeasts.WebClient.Services;

public interface IComplaintTypeService
{
    Task<IEnumerable<ComplaintType>> GetAllAsync();
    Task<ComplaintType?> GetByIdAsync(int id);
    Task<IEnumerable<ComplaintType>> GetActiveAsync();
}