
using DenounceBeasts.API.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure;
using DenounceBeasts.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MunicipalitiesController : ControllerBase
    {
        //private readonly ApplicationDbContext _unitOfWork;
        //private readonly MunicipalityRepository _municipalityRepository;
        //private readonly SectorRepository _sectorRepository;
        private readonly UnitOfWork _unitOfWork;

        public MunicipalitiesController(
            //ApplicationDbContext context,
            //MunicipalityRepository municipalityRepository,
           // SectorRepository sectorRepository, 
            UnitOfWork unitOfWork)
        {
            //_unitOfWork = context;
            //_municipalityRepository = municipalityRepository;
            //_sectorRepository = sectorRepository;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async  Task<IActionResult> GetMunicipalities()
        {
            var municipalities = await _unitOfWork.Municipalities.GetAllAsync();
            var sectosrs = await  _unitOfWork.Sectors.GetAllSectorsActiveAsync();

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
            var municipality = await _unitOfWork.Municipalities.GetByIdAsync(id) ;

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
        public async Task<IActionResult> CreateMunicipality([FromBody] MunicipalityDto request)
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
           await  _unitOfWork.Municipalities.AddAsync(municipality);

            //persisting changes to the database
            await _unitOfWork.CompleteAsync();

            //return the response
            return Ok(new { id = municipality.Id });

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMunicipality(int id, [FromBody] MunicipalityDto request)
        {
            if (request == null || request.Id != id)
            {
                return BadRequest("Municipality is null or ID mismatch.");
            }
            var existingMunicipality = await _unitOfWork.Municipalities.GetByIdAsync(  id);
            if (existingMunicipality == null)
            {
                return NotFound($"Municipality with ID {id} not found.");
            }
            existingMunicipality.Name = request.Name;
            existingMunicipality.Code = request.Code;
            existingMunicipality.UpdatedAt = DateTime.Now;
           await  _unitOfWork.Municipalities.UpdateAsync(existingMunicipality);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMunicipalityAsync(int id)
        {
         
            await _unitOfWork.Municipalities.DeleteAsync(id);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}
