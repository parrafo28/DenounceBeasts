using DenounceBeasts.API.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Data.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistrictsController : ControllerBase
    {
        //private readonly DistrictRepository _districtRepository;
        private readonly GenericRepository<District> _districtRepository;

       // public DistrictsController(DistrictRepository districtRepository)
        public DistrictsController(GenericRepository<District> districtRepository)
        {
            _districtRepository = districtRepository;
        }

        //[HttpGet]
        //[Route("by-municipality")]
        //public async Task<IActionResult> GetDistrictsByMunicipality([FromQuery] int municipalityId)
        //{
        //    if (municipalityId <= 0)
        //    {
        //        return BadRequest("Invalid municipality ID.");
        //    }
        //    var districts = await _districtRepository.GetDistrictsByMunicipalityId(municipalityId);
        //    return Ok(districts);
        //}

        //[HttpGet]
        //[Route("with-municipality")]
        //public async Task<IActionResult> GetDistrictsWithMunicipality()
        //{
        //    var districtsDb = await _districtRepository.GetDistrictsWithMunicipalties();

        //   var districtsResponse = districtsDb.Select(d => new DistrictDto
        //    {
        //        Id = d.Id,
        //        Name = d.Name,
        //        Code = d.Code,
        //        MunicipalityId = d.MunicipalityId,
        //        MunicipalityName = d.Municipality?.Name, 
        //        IsActive = d.IsActive
        //    }).ToList();
             
        //    return Ok(districtsResponse);
        //}

        [HttpGet]
        public async Task<IActionResult> GetDistricts()
        {
            var districts = await _districtRepository.GetAllAsync();

            return Ok(districts);
        }

        [HttpGet]
        [Route("{id:int}")]
        public async Task<IActionResult> GetDistrictById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid district ID.");
            }
            var district = await _districtRepository.GetByIdAsync(id);
            return Ok(district);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDistrict([FromBody] CreateDistrictDto request)
        {
            //validating
            if (request == null)
            {
                return BadRequest("District cannot be null.");
            }
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Code) || request.MunicipalityId <= 0)
            {
                return BadRequest("Invalid district data.");
            }
            //Creating the resource
            var district = new District
            {
                IsActive = request.IsActive,
                Name = request.Name,
                Code = request.Code,
                MunicipalityId = request.MunicipalityId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            district = await _districtRepository.CreateAsync(district);

            //responding to the client
            return Ok(district);

        }

        [HttpPut]
        public async Task<IActionResult> UpdateDistrict([FromBody] UpdateDistrictDto request)
        {
            if (request == null || request.Id <= 0)
            {
                return BadRequest("Invalid district data.");
            }
            var existingDistrict = await _districtRepository.GetByIdAsync(request.Id);
            if (existingDistrict == null)
            {
                return NotFound("District not found.");
            }
            existingDistrict.Name = request.Name;
            existingDistrict.Code = request.Code;
            existingDistrict.MunicipalityId = request.MunicipalityId;
            existingDistrict.IsActive = request.IsActive;
            existingDistrict.UpdatedAt = DateTime.UtcNow;

            await _districtRepository.UpdateAsync(existingDistrict);

            return Ok(existingDistrict);

        }

        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteDistrict(int id)
        {
            var existingDistrict = await _districtRepository.GetByIdAsync(id);

            if (existingDistrict == null)
            {
                return NotFound("District not found.");
            }
            var result = await _districtRepository.DeleteAsync(id);
            if (result == false)
            {
                return BadRequest("Failed to delete district.");
            }
            return NoContent(); // 204 No Content response


        }
    }
}
