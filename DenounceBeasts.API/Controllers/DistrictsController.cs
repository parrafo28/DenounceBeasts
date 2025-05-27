using DenounceBeasts.API.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistrictsController : ControllerBase
    {
        List<District> districts = new List<District>
        {
            new District { Id = 1, Name = "Downtown", Code = "DT", MunicipalityId = 1 },
            new District { Id = 2, Name = "Uptown", Code = "UT", MunicipalityId = 1 },
            new District { Id = 3, Name = "Suburbia", Code = "SB", MunicipalityId = 2 }
        };

        [HttpGet]
        public IActionResult GetDistricts()
        {
            return Ok(districts);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetDistrictById(int id)
        {

            var district = districts.Where(p => p.Id == id).FirstOrDefault();
            return Ok(district);
        }

        [HttpPost]
        public IActionResult CreateDistrict([FromBody] District district)
        {
            if (district == null)
            {
                return BadRequest("District cannot be null.");
            }
            district.Id = districts.Count + 1; // Simple ID generation logic
            districts.Add(district);
            //return CreatedAtAction(nameof(GetDistrictById), new { id = district.Id }, district);
            return Ok(districts);

        }
        [HttpPut]
        public IActionResult UpdateDistrict([FromBody] District district)
        {
            if (district == null || district.Id <= 0)
            {
                return BadRequest("Invalid district data.");
            }
            var existingDistrict = districts.FirstOrDefault(d => d.Id == district.Id);
            if (existingDistrict == null)
            {
                return NotFound("District not found.");
            }
            existingDistrict.Name = district.Name;
            existingDistrict.Code = district.Code;
            existingDistrict.MunicipalityId = district.MunicipalityId;
            existingDistrict.UpdatedAt = DateTime.UtcNow; // Assuming you want to update the timestamp
           // return Ok(existingDistrict);
            return Ok(districts);

        }
        [HttpDelete]
        [Route("{id:int}")]
        public IActionResult DeleteDistrict(int id)
        {
            var district = districts.FirstOrDefault(d => d.Id == id);
            if (district == null)
            {
                return NotFound("District not found.");
            }
            districts.Remove(district);
            // return NoContent(); // 204 No Content response
            return Ok(districts);


        }
    }
}
