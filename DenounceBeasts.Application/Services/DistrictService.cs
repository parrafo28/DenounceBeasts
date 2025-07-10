using AutoMapper;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Contracts;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Application.Services
{
    public class DistrictService : IDistrictService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public DistrictService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            this._mapper = mapper;
        }

        public async Task<List<DistrictDto>> GetDistrictsWithMunicipalities()
        {

            var districtsDb = await _unitOfWork.Districts.GetDistrictsWithMunicipalties();

            //var districtsResponse = districtsDb.Select(district => new DistrictDto
            //{
            //    Id = district.Id,
            //    Name = district.Name,
            //    Code = district.Code,
            //    MunicipalityId = district.MunicipalityId,
            //    MunicipalityName = district.Municipality?.Name,
            //    Municipality = new MunicipaltyDto
            //    {
            //        Code = district.Municipality.Code,
            //        Id = district.MunicipalityId,
            //        Name = district.Municipality.Name,
            //        IsActive = district.Municipality.IsActive
            //    },
            //    IsActive = district.IsActive
            //}).ToList();

            // var listToReturn = new List<DistrictDto>();

            //foreach (var district in districtsResponse)
            //{
            //    listToReturn.Add(new DistrictDto
            //    {
            //        Code = district.Code,
            //        Name = district.Name,
            //        Id = district.Id,
            //        IsActive = district.IsActive,
            //        MunicipalityId = district.MunicipalityId,
            //        MunicipalityName = district.Name 
            //    });
            //}
            //return districtsResponse; 
            return districtsDb != null ? _mapper.Map<List<DistrictDto>>(districtsDb) : null;

        }

        public async Task<List<DistrictDto>> GetDistricts()
        {
            var districts = await _unitOfWork.Districts.GetAllAsync();

            //var districtsResponse = districts.Select(district => new DistrictDto
            //{
            //    Id = district.Id,
            //    Name = district.Name,
            //    Code = district.Code,
            //    MunicipalityId = district.MunicipalityId,
            //    MunicipalityName = district.Municipality?.Name,
            //    IsActive = district.IsActive
            //}).ToList();

            //  return districtsResponse;
            return districts != null ? _mapper.Map<List<DistrictDto>>(districts) : null;

        }


        public async Task<DistrictDto> GetDistrictById(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentNullException("The id need to have a value");
            }
            var district = await _unitOfWork.Districts.GetByIdAsync(id);
            //var response = new DistrictDto
            //{
            //    Id = id,
            //    Name = district.Name,
            //    Code = district.Code,
            //    IsActive = district.IsActive,
            //    MunicipalityId = district.MunicipalityId
            //};
            //return response;
            return district != null ? _mapper.Map<DistrictDto>(district) : null;

        }

        public async Task<int> CreateDistrict(CreateDistrictDto request)
        {
            //validating
            if (request == null)
            {
                throw new ArgumentNullException("District cannot be null.");
            }
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Code) || request.MunicipalityId <= 0)
            {
                throw new ArgumentException("Invalid district data.");
            }
            //var district = new District
            //{
            //    IsActive = request.IsActive,
            //    Name = request.Name,
            //    Code = request.Code,
            //    MunicipalityId = request.MunicipalityId,
            //    CreatedAt = DateTime.UtcNow,
            //    UpdatedAt = DateTime.UtcNow
            //};

            var district = _mapper.Map<District>(request);

            district = await _unitOfWork.Districts.CreateAsync(district);
            await _unitOfWork.CompletAsync();

            return district.Id;
            //var response = new CreateDistrictDtoResponse
            //{
            //    Id= district.Id
            //};

            //return response; 
        }

        public async Task UpdateDistrict(UpdateDistrictDto request)
        {
            if (request == null || request.Id <= 0)
            {
                throw new ArgumentNullException("Invalid district data.");
            }
            var existingDistrict = await _unitOfWork.Districts.GetByIdAsync(request.Id);
            if (existingDistrict == null)
            {
                throw new ArgumentException("District not found.");
            }
            //existingDistrict.Name = request.Name;
            //existingDistrict.Code = request.Code;
            //existingDistrict.MunicipalityId = request.MunicipalityId;
            //existingDistrict.IsActive = request.IsActive;
            //existingDistrict.UpdatedAt = DateTime.UtcNow;

            var existingDistrictMapped = _mapper.Map<District>(request);

            await _unitOfWork.Districts.UpdateAsync(existingDistrict);
            await _unitOfWork.CompletAsync();

        }


        public async Task DeleteDistrict(int id)
        {
            var existingDistrict = await _unitOfWork.Districts.GetByIdAsync(id);

            if (existingDistrict == null)
            {
                throw new InvalidDataException("District not found.");
            }
            var result = await _unitOfWork.Districts.DeleteAsync(id);
            if (result == false)
            {
                throw new InvalidDataException("District not found.");
            }
        }
    }
}
