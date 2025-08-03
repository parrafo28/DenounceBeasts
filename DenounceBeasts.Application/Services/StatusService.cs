using AutoMapper;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Infrastructure.Contracts;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Application.Services
{
    public class StatusService : IStatusService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StatusService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<StatusDto>> GetAllAsync()
        {
            var statuses = await _unitOfWork.Status.GetAllAsync();
            return _mapper.Map<IEnumerable<StatusDto>>(statuses);
        }

        public async Task<StatusDto> GetByIdAsync(int id)
        {
            var status = await _unitOfWork.Status.GetByIdAsync(id);
            return _mapper.Map<StatusDto>(status);
        }

        public async Task<StatusDto> CreateAsync(StatusDto createDto)
        {
            var status = _mapper.Map<Status>(createDto);
            status.CreatedAt = DateTime.UtcNow;
            status.IsActive = true;
            
            await _unitOfWork.Status.AddAsync(status);
            await _unitOfWork.CompleteAsync();
            
            return _mapper.Map<StatusDto>(status);
        }

        public async Task<StatusDto> UpdateAsync(StatusDto updateDto)
        {
            var status = await _unitOfWork.Status.GetByIdAsync(updateDto.Id);
            if (status == null)
                throw new ArgumentException("Status not found");

            _mapper.Map(updateDto, status);
            status.UpdatedAt = DateTime.UtcNow;
            
            await _unitOfWork.Status.UpdateAsync(status);
            await _unitOfWork.CompleteAsync();
            
            return _mapper.Map<StatusDto>(status);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var status = await _unitOfWork.Status.GetByIdAsync(id);
            if (status == null)
                return false;

            status.IsActive = false;
            status.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Status.UpdateAsync(status);
            await _unitOfWork.CompleteAsync();
            
            return true;
        }

        public async Task<StatusDto> GetByNameAsync(string name)
        {
            var statuses = await _unitOfWork.Status.FindAsync(s => s.Name == name && s.IsActive);
            var status = statuses.FirstOrDefault();
            return _mapper.Map<StatusDto>(status);
        }

        public async Task<IEnumerable<StatusDto>> GetActiveAsync()
        {
            var statuses = await _unitOfWork.Status.FindAsync(s => s.IsActive);
            return _mapper.Map<IEnumerable<StatusDto>>(statuses);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _unitOfWork.Status.CountAsync(s => s.IsActive);
        }

        public async Task<IEnumerable<StatusDto>> GetPagedAsync(int pageNumber, int pageSize)
        {
            var statuses = await _unitOfWork.Status.GetPagedAsync(pageNumber, pageSize, s => s.IsActive);
            return _mapper.Map<IEnumerable<StatusDto>>(statuses);
        }
    }
}