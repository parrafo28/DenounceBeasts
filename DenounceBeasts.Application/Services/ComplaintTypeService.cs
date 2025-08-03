using AutoMapper;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Infrastructure.Contracts;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Application.Services
{
    public class ComplaintTypeService : IComplaintTypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ComplaintTypeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ComplaintTypeDto>> GetAllAsync()
        {
            var complaintTypes = await _unitOfWork.ComplaintTypes.GetAllAsync();
            return _mapper.Map<IEnumerable<ComplaintTypeDto>>(complaintTypes);
        }

        public async Task<ComplaintTypeDto> GetByIdAsync(int id)
        {
            var complaintType = await _unitOfWork.ComplaintTypes.GetByIdAsync(id);
            return _mapper.Map<ComplaintTypeDto>(complaintType);
        }

        public async Task<ComplaintTypeDto> CreateAsync(ComplaintTypeDto createDto)
        {
            var complaintType = _mapper.Map<ComplaintType>(createDto);
            complaintType.CreatedAt = DateTime.UtcNow;
            complaintType.IsActive = true;
            
            await _unitOfWork.ComplaintTypes.AddAsync(complaintType);
            await _unitOfWork.CompleteAsync();
            
            return _mapper.Map<ComplaintTypeDto>(complaintType);
        }

        public async Task<ComplaintTypeDto> UpdateAsync(ComplaintTypeDto updateDto)
        {
            var complaintType = await _unitOfWork.ComplaintTypes.GetByIdAsync(updateDto.Id);
            if (complaintType == null)
                throw new ArgumentException("ComplaintType not found");

            _mapper.Map(updateDto, complaintType);
            complaintType.UpdatedAt = DateTime.UtcNow;
            
            await _unitOfWork.ComplaintTypes.UpdateAsync(complaintType);
            await _unitOfWork.CompleteAsync();
            
            return _mapper.Map<ComplaintTypeDto>(complaintType);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var complaintType = await _unitOfWork.ComplaintTypes.GetByIdAsync(id);
            if (complaintType == null)
                return false;

            complaintType.IsActive = false;
            complaintType.UpdatedAt = DateTime.UtcNow;
            
            await _unitOfWork.ComplaintTypes.UpdateAsync(complaintType);
            await _unitOfWork.CompleteAsync();
            
            return true;
        }

        public async Task<ComplaintTypeDto> GetByNameAsync(string name)
        {
            var complaintTypes = await _unitOfWork.ComplaintTypes.FindAsync(ct => ct.Name == name && ct.IsActive);
            var complaintType = complaintTypes.FirstOrDefault();
            return _mapper.Map<ComplaintTypeDto>(complaintType);
        }

        public async Task<IEnumerable<ComplaintTypeDto>> GetActiveAsync()
        {
            var complaintTypes = await _unitOfWork.ComplaintTypes.FindAsync(ct => ct.IsActive);
            return _mapper.Map<IEnumerable<ComplaintTypeDto>>(complaintTypes);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _unitOfWork.ComplaintTypes.CountAsync(ct => ct.IsActive);
        }

        public async Task<IEnumerable<ComplaintTypeDto>> GetPagedAsync(int pageNumber, int pageSize)
        {
            var complaintTypes = await _unitOfWork.ComplaintTypes.GetPagedAsync(pageNumber, pageSize, ct => ct.IsActive);
            return _mapper.Map<IEnumerable<ComplaintTypeDto>>(complaintTypes);
        }
    }
}