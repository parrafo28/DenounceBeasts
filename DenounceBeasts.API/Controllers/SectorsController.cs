using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectorsController : ControllerBase
    {
        private readonly ISectorService _sectorService;

        //  private readonly GenericRepository<Sector> repository;

        // private readonly ApplicationDbContext _context;
        // private readonly SectorRepository _sectorRepository;
        //private readonly UnitOfWork _unitOfWork;


        public SectorsController(
            ISectorService sectorService
            //ApplicationDbContext context,
            //    SectorRepository sectorRepository,
            //  GenericRepository<Sector> repository,
            // UnitOfWork unitOfWork
            )
        {
            // this.repository = repository;
            // _context = context;
            // _sectorRepository = sectorRepository;
            //_unitOfWork = unitOfWork;
            this._sectorService = sectorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSectors()
        {
            // var sectors = await _sectorRepository.GetAllSectorsAsync();

            // return Ok(await _sectorRepository.GetAllSectorsAsync());
            // var status = await _unitOfWork.Status.GetAllAsync();

            return Ok(await _sectorService.GetSectors());
        }

        [HttpGet]
        [Route("with-municipality")]
        public async Task<IActionResult> GetSectorsWithMunicipality()
        {
            //var sectors = await _unitOfWork.Sectors.GetSectorWithTheirMunicipalityAsync();

            //var sectorsResponse = new List<SectorDto>();

            //sectorsResponse = sectors.Select(s => new SectorDto
            //{
            //    Id = s.Id,
            //    Code = s.Code,
            //    Name = s.Name,
            //    MunicipalityId = s.MunicipalityId,
            //    MunicipalityName = s.Municipality.Name,
            //    MunicipalityCode = s.Municipality.Code
            //    //Municipality = new MunicipalityDto
            //    //{
            //    //    Id = s.Municipality.Id,
            //    //    Code = s.Municipality.Code,
            //    //    Name = s.Municipality.Name
            //    //}

            //}).ToList();

            return Ok(await _sectorService.GetSectorsWithMunicipality());
        }

        [HttpGet]
        [Route("by-municipality")]
        public async Task<IActionResult> GetSectorsByMunicipality([FromQuery] int municipalityId)
        {
            return Ok(await _sectorService.GetSectorsByMunicipality(municipalityId));

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSector(int id)
        {
            //var sector = await _unitOfWork.Sectors.GetByIdAsync(id);
            //if (sector == null)
            //{
            //    return NotFound($"Sector with ID {id} not found.");
            //}
            //var sectorResponse = new SectorDto
            //{
            //    Id = sector.Id,
            //    Code = sector.Code,
            //    Name = sector.Name,
            //    MunicipalityId = sector.MunicipalityId
            //};
            return Ok(await _sectorService.GetSector(id));
        }

        [HttpPost]
        public async Task<IActionResult> CreateSector([FromBody] CreateSectorDto request)
        {
            //if (request == null)
            //{
            //    return BadRequest("Sector cannot be null.");
            //}

            //var sector = new Sector
            //{
            //    Code = request.Code,
            //    CreatedAt = DateTime.Now,
            //    MunicipalityId = request.MunicipalityId,
            //    Name = request.Name,
            //};
            ////var response = await _sectorRepository.AddSectorAsync(sector);
            ////   await _unitOfWork.BeginTransactionAsync();
            //sector = await _unitOfWork.Sectors.AddAsync(sector);
            //await _unitOfWork.CompleteAsync();
            //// await _unitOfWork.CommitTransactionAsync();
            var responseId = await _sectorService.CreateSector(request);
            return Ok(new { id = responseId });

        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSector(int id, [FromBody] UpdateSectorDto request)
        {
            //if (request == null || request.Id != id)
            //{
            //    return BadRequest("Sector is null or ID mismatch.");
            //}
            ////var existingSector = _sectorRepository.GetSectorByIdAsync(id).Result;
            //var existingSector = await _unitOfWork.Sectors.GetByIdAsync(id);
            //if (existingSector == null)
            //{
            //    return NotFound($"Sector with ID {id} not found.");
            //}
            //existingSector.Name = request.Name;
            //existingSector.Code = request.Code;
            //existingSector.UpdatedAt = DateTime.Now;
            //existingSector.MunicipalityId = request.MunicipalityId;
            ////  _sectorRepository.UpdateSectorAsync(existingSector).Wait();
            //await _unitOfWork.Sectors.UpdateAsync(existingSector);
            //await _unitOfWork.CompleteAsync();
            await _sectorService.UpdateSector(id, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSector(int id)
        {
            //var sector = _unitOfWork.Sectors.GetByIdAsync(id);
            //if (sector == null)
            //{
            //    return NotFound($"Sector with ID {id} not found.");
            //}
            //await _unitOfWork.Sectors.DeleteAsync(id);
            //await _unitOfWork.CompleteAsync();
            await _sectorService.DeleteSector(id);
            return NoContent();
        }
    }
}
