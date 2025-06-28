using DenounceBeasts.API.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure;
using DenounceBeasts.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly SectorRepository _sectorRepository;

        public SectorsController(ApplicationDbContext context, SectorRepository sectorRepository)
        {
            _context = context;
            _sectorRepository = sectorRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetSectors()
        {
            // var sectors = await _sectorRepository.GetAllSectorsAsync();

            return Ok(await _sectorRepository.GetAllSectorsAsync());
        }

        [HttpGet]
        [Route("with-municipality")]
        public async Task<IActionResult> GetSectorsWithMunicipality()
        {
            var sectors = await _sectorRepository.GetSectorWithTheirMunicipaltyAsync();

            var sectorsResponse = new List<SectorDto>();

            sectorsResponse = sectors.Select(s => new SectorDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                MunicipalityId = s.MunicipalityId,
                MunicipaltyName = s.Municipality.Name,
                MunicipaltyCode = s.Municipality.Code
                //Municipality = new MunicipalityDto
                //{
                //    Id = s.Municipality.Id,
                //    Code = s.Municipality.Code,
                //    Name = s.Municipality.Name
                //}

            }).ToList();

            return Ok(sectorsResponse);
        }

        [HttpGet]
        [Route("by-municipality")]
        public async Task<IActionResult> GetSectorsByMunicipality([FromQuery] int municipalityId)
        {
            return Ok(await _sectorRepository.GetSectorsByMunicipalityId(municipalityId));

        } 

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSector(int id)
        {
            var sector = await _sectorRepository.GetSectorByIdAsync(id);
            if (sector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            var sectorResponse = new SectorDto
            {
                Id = sector.Id,
                Code = sector.Code,
                Name = sector.Name,
                MunicipalityId = sector.MunicipalityId
            };
            return Ok(sectorResponse);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSector([FromBody] CreateSectorDto request)
        {
            if (request == null)
            {
                return BadRequest("Sector cannot be null.");
            }

            var sector = new Sector
            {
                Code = request.Code,
                CreatedAt = DateTime.Now,
                MunicipalityId = request.MunicipalityId,
                Name = request.Name,
            };
            //var response = await _sectorRepository.AddSectorAsync(sector);
            sector = await _sectorRepository.AddSectorAsync(sector);

            return Ok(new { id = sector.Id });

        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSector(int id, [FromBody] UpdateSectorDto request)
        {
            if (request == null || request.Id != id)
            {
                return BadRequest("Sector is null or ID mismatch.");
            }
            //var existingSector = _sectorRepository.GetSectorByIdAsync(id).Result;
            var existingSector = await _sectorRepository.GetSectorByIdAsync(id);
            if (existingSector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            existingSector.Name = request.Name;
            existingSector.Code = request.Code;
            existingSector.UpdatedAt = DateTime.Now;
            existingSector.MunicipalityId = request.MunicipalityId;
            //  _sectorRepository.UpdateSectorAsync(existingSector).Wait();
            await _sectorRepository.UpdateSectorAsync(existingSector);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSector(int id)
        {
            var sector = _sectorRepository.GetSectorByIdAsync(id);
            if (sector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            await _sectorRepository.DeleteSectorAsync(id);
            return NoContent();
        }
    }
}
