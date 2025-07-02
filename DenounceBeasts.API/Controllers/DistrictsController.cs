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
        //private readonly GenericRepository<District> _districtRepository;
        //private readonly MunicipaltyRepository _municipaltyRepository;
        private readonly UnitOfWork _unitOfWork;

        // public DistrictsController(DistrictRepository districtRepository)
        public DistrictsController(
            //GenericRepository<District> districtRepository,
            //MunicipaltyRepository municipaltyRepository,
            UnitOfWork unitOfWork)
        {
            //_districtRepository = districtRepository;
            //_municipaltyRepository = municipaltyRepository;
            _unitOfWork = unitOfWork;
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

        [HttpGet]
        [Route("with-municipality")]
        public async Task<IActionResult> GetDistrictsWithMunicipality()
        {
            //var municipalties = await _municipaltyRepository.GetAllAsync();
            var municipalties = await _unitOfWork.Municipalities.GetAllAsync();

          //  var districtsDb = await _districtRepository.GetAllAsync();
            var districtsDb = await _unitOfWork.Districts.GetAllAsync();

            var districtsResponse = districtsDb.Select(district => new DistrictDto
            {
                Id = district.Id,
                Name = district.Name,
                Code = district.Code,
                MunicipalityId = district.MunicipalityId,
                // MunicipalityName = d.Municipality?.Name,
                MunicipalityName = municipalties.FirstOrDefault(m => m.Id == district.MunicipalityId).Name,
                IsActive = district.IsActive
            }).ToList();

            return Ok(districtsResponse);
        }

        [HttpGet]
        public async Task<IActionResult> GetDistricts()
        {
            var districts = await _unitOfWork.Districts.GetAllAsync();

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
            var district = await _unitOfWork.Districts.GetByIdAsync(id);
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

            district = await _unitOfWork.Districts.CreateAsync(district);
            await _unitOfWork.CompletAsync();
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
            var existingDistrict = await _unitOfWork.Districts.GetByIdAsync(request.Id);
            if (existingDistrict == null)
            {
                return NotFound("District not found.");
            }
            existingDistrict.Name = request.Name;
            existingDistrict.Code = request.Code;
            existingDistrict.MunicipalityId = request.MunicipalityId;
            existingDistrict.IsActive = request.IsActive;
            existingDistrict.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Districts.UpdateAsync(existingDistrict);
            await _unitOfWork.CompletAsync();
            return Ok(existingDistrict);

        }

        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteDistrict(int id)
        {
            var existingDistrict = await _unitOfWork.Districts.GetByIdAsync(id);

            if (existingDistrict == null)
            {
                return NotFound("District not found.");
            }
            var result = await _unitOfWork.Districts.DeleteAsync(id);
            if (result == false)
            {
                return BadRequest("Failed to delete district.");
            }
            return NoContent(); // 204 No Content response


        }
    }
}
