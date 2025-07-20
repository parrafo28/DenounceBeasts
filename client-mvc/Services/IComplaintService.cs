using DenounceBeasts.WebClient.Models.Domain;

namespace DenounceBeasts.WebClient.Services;

public interface IComplaintService
{
    Task<IEnumerable<Complaint>> GetAllAsync();
    Task<Complaint?> GetByIdAsync(int id);
    Task<Complaint?> CreateAsync(Complaint complaint);
    Task<Complaint?> UpdateAsync(int id, Complaint complaint);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Complaint>> SearchAsync(string? query = null, int? municipalityId = null, int? complaintTypeId = null, int? statusId = null, Priority? priority = null);
    Task<IEnumerable<Complaint>> GetByMunicipalityAsync(int municipalityId);
    Task<IEnumerable<Complaint>> GetBySectorAsync(int sectorId);
    Task<IEnumerable<Complaint>> GetByComplaintTypeAsync(int complaintTypeId);
    Task<IEnumerable<Complaint>> GetByStatusAsync(int statusId);
}