
using DenounceBeasts.API.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure;
using DenounceBeasts.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MunicipalitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly MunicipaltyRepository _municipaltyRepository;
        private readonly SectorRepository _sectorRepository;

        public MunicipalitiesController(ApplicationDbContext context, MunicipaltyRepository municipaltyRepository, SectorRepository sectorRepository)
        {
            _context = context;
            _municipaltyRepository = municipaltyRepository;
            _sectorRepository = sectorRepository;
        }

        [HttpGet]
        public IActionResult GetMunicipalities()
        {
            var municipalities = _context.Municipalities.ToList();
            var sectosrs = _context.Sectors.ToList();

            var municipalitiesResponse = new List<MunicipalityDto>();

            municipalitiesResponse = municipalities.Select(s => new MunicipalityDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                Sector = sectosrs.Where(sector => sector.MunicipalityId == s.Id).Select(sector => new SectorDto
                {
                    Id = sector.Id,
                    Code = sector.Code,
                    Name = sector.Name,
                    MunicipalityId = sector.MunicipalityId
                }).ToList()
            }).ToList();

            //foreach (var municipality in municipalities)
            //{
            //    municipality.Sectors = sectosrs.Where(s => s.MunicipalityId == municipality.Id).ToList();
            //}

            return Ok(municipalitiesResponse);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMunicipality(int id)
        {
            var municipality = await _context.Municipalities
                .Where(s => s.Id == id).FirstOrDefaultAsync();

            if (municipality == null)
            {
                return NotFound($"Municipality with ID {id} not found.");
            }
            var municipalityResponse = new MunicipalityDto
            {
                Id = municipality.Id,
                Code = municipality.Code,
                Name = municipality.Name,
            };
            return Ok(municipalityResponse);
        }

        [HttpPost]
        public IActionResult CreateMunicipality([FromBody] MunicipalityDto request)
        {
            //validations
            if (request == null)
            {
                return BadRequest("Municipality cannot be null.");
            }
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest("Municipality Name and Code cannot be empty.");
            }

            //creating resources
            var municipality = new Municipality
            {
                Code = request.Code,
                CreatedAt = DateTime.Now,
                Name = request.Name,
            };
            _context.Municipalities.Add(municipality);

            //persisting changes to the database
            _context.SaveChanges();

            //return the response
            return Ok(new { id = municipality.Id });

        }

        [HttpPut("{id}")]
        public IActionResult UpdateMunicipality(int id, [FromBody] MunicipalityDto request)
        {
            if (request == null || request.Id != id)
            {
                return BadRequest("Municipality is null or ID mismatch.");
            }
            var existingMunicipality = _context.Municipalities.FirstOrDefault(s => s.Id == id);
            if (existingMunicipality == null)
            {
                return NotFound($"Municipality with ID {id} not found.");
            }
            existingMunicipality.Name = request.Name;
            existingMunicipality.Code = request.Code;
            existingMunicipality.UpdatedAt = DateTime.Now;
            _context.Municipalities.Update(existingMunicipality);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteMunicipality(int id)
        {
            var municipality = _context.Municipalities.FirstOrDefault(s => s.Id == id);
            if (municipality == null)
            {
                return NotFound($"Municipality with ID {id} not found.");
            }
            _context.Municipalities.Remove(municipality);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
