using DenounceBeasts.API.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Data;
using DenounceBeasts.Infrastructure.Data.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MunicipalitiesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly UnitOfWork _unitOfWork;

        public MunicipalitiesController(DataContext context,
            UnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetMunicipalities()
        {
            return Ok(await _unitOfWork.Municipalities.GetAllAsync());
        }
        [HttpGet]
        [Route("with-districts")]
        public async Task<IActionResult> GetMunicipalitiesWithDistricts()
        {
            return Ok(await _unitOfWork.Municipalities.GetMunicipaltiesWithDistricts());
        }

        [HttpGet]
        [Route("{id:int}")]
        public async Task<IActionResult> GetMunicipalityById(int id)
        {
            return Ok(await _unitOfWork.Municipalities.GetByIdAsync(id));
        }

        [HttpPost]
        public async Task<IActionResult> CreateMunicipality([FromBody] MunicipaltyDto request)
        {
            //validating
            if (request == null)
            {
                return BadRequest("Municipality cannot be null.");
            }
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest("Invalid Municipality data.");
            }
            //Creating the resource
            var municipality = new Municipality
            {
                IsActive = request.IsActive,
                Name = request.Name,
                Code = request.Code,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            //peristing the resource
            municipality = await _unitOfWork.Municipalities.CreateAsync(municipality);
            await _unitOfWork.CompletAsync();

            //responding to the client
            return Ok(municipality);

        }

        [HttpPut]
        public async Task<IActionResult> UpdateMunicipality([FromBody] MunicipaltyDto request)
        {
            if (request == null || request.Id <= 0)
            {
                return BadRequest("Invalid Municipality data.");
            }
            var existingMunicipality = await _unitOfWork.Municipalities.GetByIdAsync(request.Id);
            if (existingMunicipality == null)
            {
                return NotFound("Municipality not found.");
            }
            existingMunicipality.Name = request.Name;
            existingMunicipality.Code = request.Code;
            existingMunicipality.IsActive = request.IsActive;
            existingMunicipality.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Municipalities.UpdateAsync(existingMunicipality);
            await _unitOfWork.CompletAsync();

            return Ok(existingMunicipality);

        }

        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteMunicipality(int id)
        {
            var existingMunicipality = await _unitOfWork.Municipalities.GetByIdAsync(id);
            if (existingMunicipality == null)
            {
                return NotFound("Municipality not found.");
            }

            await _unitOfWork.Municipalities.DeleteAsync(id);
            await _unitOfWork.CompletAsync();
            return NoContent(); // 204 No Content response 
        }
    }
}
