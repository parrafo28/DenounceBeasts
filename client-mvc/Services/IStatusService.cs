using DenounceBeasts.WebClient.Models.Domain;

namespace DenounceBeasts.WebClient.Services;

public interface IStatusService
{
    Task<IEnumerable<Status>> GetAllAsync();
    Task<Status?> GetByIdAsync(int id);
    Task<IEnumerable<Status>> GetActiveAsync();
}