using DenounceBeasts.API.Data;
using DenounceBeasts.API.DTOs;
using DenounceBeasts.API.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistrictsController : ControllerBase
    {
        private readonly DataContext _context;

        public DistrictsController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetDistricts()
        {
            var districts = _context.Districts.ToList();

            return Ok(districts);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetDistrictById(int id)
        {

            var district = _context.Districts.Where(p => p.Id == id).FirstOrDefault();
            return Ok(district);
        }

        [HttpPost]
        public IActionResult CreateDistrict([FromBody] CreateDistrictDto request)
        {
            if (request == null)
            {
                return BadRequest("District cannot be null.");
            }
            var district = new District
            {
                IsActive = request.IsActive,
                Name = request.Name,
                Code = request.Code,
                MunicipalityId = request.MunicipalityId, 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
         
            _context.Districts.Add(district);
            _context.SaveChanges();
            return Ok(district);

        }

        [HttpPut]
        public IActionResult UpdateDistrict([FromBody] UpdateDistrictDto request)
        {
            if (request == null || request.Id <= 0)
            {
                return BadRequest("Invalid district data.");
            }
            var existingDistrict = _context.Districts.FirstOrDefault(d => d.Id == request.Id);
            if (existingDistrict == null)
            {
                return NotFound("District not found.");
            }
            existingDistrict.Name = request.Name;
            existingDistrict.Code = request.Code;
            existingDistrict.MunicipalityId = request.MunicipalityId;
            existingDistrict.IsActive = request.IsActive;
            existingDistrict.UpdatedAt = DateTime.UtcNow;
            _context.Update(existingDistrict);
            _context.SaveChanges();

            return Ok(existingDistrict);

        }

        [HttpDelete]
        [Route("{id:int}")]
        public IActionResult DeleteDistrict(int id)
        {
            var district = _context.Districts.FirstOrDefault(d => d.Id == id);
            if (district == null)
            {
                return NotFound("District not found.");
            }
            _context.Districts.Remove(district);
            _context.SaveChanges();
            return NoContent(); // 204 No Content response
            

        }
    }
}
