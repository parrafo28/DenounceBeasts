using DenounceBeasts.API.Data;
using DenounceBeasts.API.DTOs;
using DenounceBeasts.API.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MunicipalitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MunicipalitiesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetMunicipalities()
        {
            var municipalities = _context.Municipalities.ToList();

            var municipalitiesResponse = new List<MunicipalityDto>();
             
            municipalitiesResponse = municipalities.Select(s => new MunicipalityDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name
            }).ToList();
             
            return Ok(municipalitiesResponse);
        }

        [HttpGet("{id}")]
        public IActionResult GetMunicipality(int id)
        {
                    var municipality = _context.Municipalities.Where(s => s.Id == id).FirstOrDefault();
            if (municipality == null)
            {
                return NotFound($"Municipality with ID {id} not found.");
            }
            var municipalityResponse = new MunicipalityDto
            {
                Id = municipality.Id,
                Code = municipality.Code,
                Name = municipality.Name,
                MunicipalityId = municipality.MunicipalityId
            };
            return Ok(municipalityResponse); 
        }

        [HttpPost]
        public IActionResult CreateMunicipality([FromBody] CreateMunicipalityDto request)
        {
            if (request == null)
            {
                return BadRequest("Municipality cannot be null.");
            }
        
            var municipality = new Municipality
            {
                Code = request.Code,
                CreatedAt = DateTime.Now,
                MunicipalityId = request.MunicipalityId,
                Name = request.Name,
            };
            _context.Municipalities.Add(municipality);
            _context.SaveChanges();
            return Ok(new { id = municipality.Id });

        }

            [HttpPut("{id}")]
        public IActionResult UpdateMunicipality(int id, [FromBody] UpdateMunicipalityDto request)
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
            existingMunicipality.MunicipalityId = request.MunicipalityId;
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
