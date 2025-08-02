using AutoMapper;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;

namespace DenounceBeasts.Application.Services
{
    public class ComplaintService : IComplaintService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ComplaintService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ComplaintDto>> GetAllAsync()
        {
            var complaints = await _unitOfWork.Complaints.GetAllAsync();
            return _mapper.Map<IEnumerable<ComplaintDto>>(complaints);
        }

        public async Task<ComplaintDto> GetByIdAsync(int id)
        {
            var complaint = await _unitOfWork.Complaints.GetByIdAsync(id);
            return _mapper.Map<ComplaintDto>(complaint);
        }

        public async Task<ComplaintDto> CreateAsync(CreateComplaintDto createDto)
        {
            var complaint = _mapper.Map<Complaint>(createDto);
            complaint.CreatedAt = DateTime.UtcNow;
            complaint.IsActive = true;

            await _unitOfWork.Complaints.AddAsync(complaint);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ComplaintDto>(complaint);
        }

        public async Task<ComplaintDto> UpdateAsync(UpdateComplaintDto updateDto)
        {
            var complaint = await _unitOfWork.Complaints.GetByIdAsync(updateDto.Id);
            if (complaint == null)
                throw new ArgumentException("Complaint not found");

            _mapper.Map(updateDto, complaint);
            complaint.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Complaints.Update(complaint);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ComplaintDto>(complaint);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var complaint = await _unitOfWork.Complaints.GetByIdAsync(id);
            if (complaint == null)
                return false;

            complaint.IsActive = false;
            complaint.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Complaints.Update(complaint);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<ComplaintDto>> GetByUserIdAsync(int userId)
        {
            var complaints = await _unitOfWork.Complaints.FindAsync(c => c.UserId == userId && c.IsActive);
            return _mapper.Map<IEnumerable<ComplaintDto>>(complaints);
        }

        public async Task<IEnumerable<ComplaintDto>> GetByStatusIdAsync(int statusId)
        {
            var complaints = await _unitOfWork.Complaints.FindAsync(c => c.StatusId == statusId && c.IsActive);
            return _mapper.Map<IEnumerable<ComplaintDto>>(complaints);
        }

        public async Task<IEnumerable<ComplaintDto>> GetByComplaintTypeIdAsync(int complaintTypeId)
        {
            var complaints = await _unitOfWork.Complaints.FindAsync(c => c.ComplaintTypeId == complaintTypeId && c.IsActive);
            return _mapper.Map<IEnumerable<ComplaintDto>>(complaints);
        }

        public async Task<IEnumerable<ComplaintDto>> GetBySectorIdAsync(int sectorId)
        {
            var complaints = await _unitOfWork.Complaints.FindAsync(c => c.SectorId == sectorId && c.IsActive);
            return _mapper.Map<IEnumerable<ComplaintDto>>(complaints);
        }

        public async Task<IEnumerable<ComplaintDto>> GetByLocationAsync(double latitude, double longitude, double radiusKm)
        {
            var complaints = await _unitOfWork.Complaints.FindAsync(c => c.IsActive);
            var filteredComplaints = complaints.Where(c =>
                CalculateDistance(latitude, longitude, c.Latitude.Value, c.Longitude.Value) <= radiusKm);
            return _mapper.Map<IEnumerable<ComplaintDto>>(filteredComplaints);
        }

        public async Task<bool> UpdateStatusAsync(int complaintId, int statusId, string comments, int? userId = null)
        {
            var complaint = await _unitOfWork.Complaints.GetByIdAsync(complaintId);
            if (complaint == null)
                return false;

            complaint.StatusId = statusId;
            complaint.UpdatedAt = DateTime.UtcNow;

            var history = new ComplaintHistory
            {
                ComplaintId = complaintId,
                StatusId = statusId,
                UserId = userId,
                Comments = comments,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _unitOfWork.Complaints.Update(complaint);
            await _unitOfWork.ComplaintHistories.AddAsync(history);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _unitOfWork.Complaints.CountAsync(c => c.IsActive);
        }

        public async Task<IEnumerable<ComplaintDto>> GetPagedAsync(int pageNumber, int pageSize)
        {
            var complaints = await _unitOfWork.Complaints.GetPagedAsync(pageNumber, pageSize, c => c.IsActive);
            return _mapper.Map<IEnumerable<ComplaintDto>>(complaints);
        }

        public async Task<IEnumerable<ComplaintDto>> SearchAsync(string searchTerm)
        {
            var complaints = await _unitOfWork.Complaints.FindAsync(c =>
                c.IsActive && (c.Title.Contains(searchTerm) || c.Description.Contains(searchTerm)));
            return _mapper.Map<IEnumerable<ComplaintDto>>(complaints);
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }
}