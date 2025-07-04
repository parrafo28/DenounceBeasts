using DenounceBeasts.API.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MunicipalitiesController : ControllerBase
    {
        private readonly DataContext _context;

        public MunicipalitiesController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetMunicipalities()
        {

            var municipalities = _context.Municipalities.Where(p => p.IsActive)
                .ToList();

            return Ok(municipalities);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetMunicipalityById(int id)
        {

            var municipality = _context.Municipalities.Where(p => p.Id == id).FirstOrDefault();
            return Ok(municipality);
        }

        [HttpPost]
        public IActionResult CreateMunicipality([FromBody] MunicipalityDto request)
        {
            if (request == null)
            {
                return BadRequest("Municipality cannot be null.");
            }

            var municipality = new Municipality
            {
                Name = request.Name,
                Code = request.Code,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Municipalities.Add(municipality);
            _context.SaveChanges();
            return Ok(new { id = municipality.Id });


        }

        [HttpPut]
        public IActionResult UpdateMunicipality([FromBody] MunicipalityDto request)
        {
            if (request == null || request.Id <= 0)
            {
                return BadRequest("Invalid municipality data.");
            }
            var existingMunicipality = _context.Municipalities.FirstOrDefault(d => d.Id == request.Id);
            if (existingMunicipality == null)
            {
                return NotFound("Municipality not found.");
            }
            existingMunicipality.Name = request.Name;
            existingMunicipality.Code = request.Code;
            existingMunicipality.IsActive = request.IsActive;
            existingMunicipality.UpdatedAt = DateTime.UtcNow;
            _context.Municipalities.Update(existingMunicipality);
            _context.SaveChanges();
            // return Ok(existingMunicipality);
            return NoContent();

        }

        [HttpDelete]
        [Route("{id:int}")]
        public IActionResult DeleteMunicipality(int id)
        {
            var municipality = _context.Municipalities.FirstOrDefault(d => d.Id == id);
            if (municipality == null)
            {
                return NotFound("Municipality not found.");
            }
            _context.Municipalities.Remove(municipality);
            _context.SaveChanges();
            return NoContent();
        }
    }
}