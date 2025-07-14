
using AutoMapper;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;

namespace DenounceBeasts.Application.Services
{

    public class SectorService : ISectorService
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public SectorService(
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            this._mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<SectorDto>> GetSectors()
        {
            var sectors = await _unitOfWork.Sectors.GetAllAsync();

            //var sectorList = new List<SectorDto>();
            //foreach (var sector in sectors)
            //{
            //    sectorList.Add(new SectorDto
            //    {
            //        Id = sector.Id,
            //        Name = sector.Name,
            //        Code = sector.Code,
            //        MunicipalityId = sector.MunicipalityId,
            //    }); 
            //}
            //var sectorsList2 = sectors.Select(s => new SectorDto
            //{
            //    Id = s.Id,
            //    Name = s.Name,
            //    Code = s.Code,
            //    MunicipalityId = s.MunicipalityId,
            //}).ToList();
            var response = _mapper.Map<List<SectorDto>>(sectors);

            return response;
        }

        public async Task<List<SectorDto>> GetSectorsWithMunicipality()
        {
            var sectors = await _unitOfWork.Sectors.GetSectorWithTheirMunicipalityAsync();

            //var sectorsResponse = new List<SectorDto>();

            //sectorsResponse = sectors.Select(s => new SectorDto
            //{
            //    Id = s.Id,
            //    Code = s.Code,
            //    Name = s.Name,
            //    MunicipalityId = s.MunicipalityId,
            //    MunicipalityName = s.Municipality.Name,
            //    MunicipalityCode = s.Municipality.Code,
            //    Municipality = new MunicipalityDto
            //    {
            //        Id = s.Municipality.Id,
            //        Code = s.Municipality.Code,
            //        Name = s.Municipality.Name
            //    }

            //}).ToList();

            var response = _mapper.Map<List<SectorDto>>(sectors);

            return response;
        }

        public async Task<List<SectorDto>> GetSectorsByMunicipality(int municipalityId)
        {
            var sectors = await _unitOfWork.Sectors.GetSectorsByMunicipalityId(municipalityId);
            //var sectorsList = sectors.Select(s => new SectorDto
            //{
            //    Id = s.Id,
            //    Name = s.Name,
            //    Code = s.Code,
            //    MunicipalityId = s.MunicipalityId,
            //}).ToList();
            var response = _mapper.Map<List<SectorDto>>(sectors);

            return response;

        }

        public async Task<SectorDto> GetSector(int id)
        {
            var sector = await _unitOfWork.Sectors.GetByIdAsync(id);
            if (sector == null)
            {
                throw new Exception($"Sector with ID {id} not found.");
            }
            //var sectorResponse = new SectorDto
            //{
            //    Id = sector.Id,
            //    Code = sector.Code,
            //    Name = sector.Name,
            //    MunicipalityId = sector.MunicipalityId
            //};
            var response = _mapper.Map<SectorDto>(sector);

            return response;
        }

        public async Task<int> CreateSector(CreateSectorDto request)
        {
            if (request == null)
            {
                throw new Exception("Sector cannot be null.");
            }

            //var sector = new Sector
            //{
            //    Code = request.Code,
            //    CreatedAt = DateTime.Now,
            //    MunicipalityId = request.MunicipalityId,
            //    Name = request.Name,
            //};
            var sector = _mapper.Map<Sector>(request);
            sector.CreatedAt = DateTime.Now;
            
            sector = await _unitOfWork.Sectors.AddAsync(sector);
            await _unitOfWork.CompleteAsync();

            return sector.Id;

        }


        public async Task UpdateSector(int id, UpdateSectorDto request)
        {
            if (request == null || request.Id != id)
            {
                throw new Exception("Sector is null or ID mismatch.");
            }
            var existingSector = await _unitOfWork.Sectors.GetByIdAsync(id);
            if (existingSector == null)
            {
                throw new Exception($"Sector with ID {id} not found.");
            }
            //existingSector.Name = request.Name;
            //existingSector.Code = request.Code;
            //existingSector.UpdatedAt = DateTime.Now;
            //existingSector.MunicipalityId = request.MunicipalityId;
            existingSector = _mapper.Map<Sector>(request);
            existingSector.UpdatedAt = DateTime.Now;

            await _unitOfWork.Sectors.UpdateAsync(existingSector);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteSector(int id)
        {
            var sector = _unitOfWork.Sectors.GetByIdAsync(id);
            if (sector == null)
            {
                throw new Exception($"Sector with ID {id} not found.");
            }
            await _unitOfWork.Sectors.DeleteAsync(id);
            await _unitOfWork.CompleteAsync();
        }
    }
}
