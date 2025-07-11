using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistrictsController : ControllerBase
    {
        private readonly IDistrictService _districtService;

        //private readonly IUnitOfWork _unitOfWork;
        //private readonly IDistrictRepository _districtRepository;
        //// private readonly GenericRepository<District> _districtRepository;
        ////private readonly GenericRepository<Municipality> _municipalityRepository;
        //private readonly IMunicipalityRepository _municipalityRepository;
        //private readonly DataContext _context;

        public DistrictsController(
            IDistrictService districtService
            //IUnitOfWork unitOfWork,
            //IDistrictRepository districtRepository,
            // IMunicipalityRepository municipalityRepository,
            //// GenericRepository<Municipality> municipalityRepository,
            //DataContext context
            )
        {
            _districtService = districtService;
            //_unitOfWork = unitOfWork;
            //_districtRepository = districtRepository;
            ////  _municipalityRepository = municipalityRepository;
            //_municipalityRepository = municipalityRepository;
            //_context = context;
        }

        [HttpGet]
        [Route("by-municipality")]
        public async Task<IActionResult> GetDistrictsByMunicipalityId([FromQuery] int municipalityId)
        {
            //if (municipalityId <= 0)
            //{
            //    return BadRequest("Invalid municipality ID.");
            //}
            //// var districts = _districtRepository.GetDistrictsByMunicipalityId(municipalityId);
            //var districts = _unitOfWork.Districts.GetDistrictsByMunicipalityId(municipalityId);
            //if (districts == null || !districts.Any())
            //{
            //    return NotFound("No districts found for the specified municipality.");
            //}

            ////var listOfDistrct = new List<DistrictDto>();

            ////foreach (var district in districts)
            ////{
            ////    //var distrctDto = new DistrictDto(); 
            ////    //distrctDto.Id = district.Id;
            ////    //distrctDto.Name = district.Name;
            ////    //distrctDto.Code = district.Code;
            ////    //distrctDto.MunicipalityId = district.MunicipalityId;
            ////    //distrctDto.MunicipalityName = district.Municipality?.Name ?? "Unknown";
            ////    //listOfDistrct.Add(distrctDto);

            ////    listOfDistrct.Add(new DistrictDto
            ////    {
            ////        Id = district.Id,
            ////        Name = district.Name,
            ////        Code = district.Code,
            ////        MunicipalityId = district.MunicipalityId,
            ////        MunicipalityName = district.Municipality?.Name ?? "Unknown"
            ////    });
            ////}


            //var districtsWithMunicipality = districts
            //    .Select(d => new DistrictDto
            //    {
            //        Id = d.Id,
            //        Name = d.Name,
            //        Code = d.Code,
            //        MunicipalityName = d.Municipality?.Name ?? "Unknown",
            //    }).ToList();

            return Ok(await _districtService.GetDistrictsByMunicipalityId(municipalityId));
        }

        [HttpGet]
        public async Task<IActionResult> GetDistricts()
        {
            //var temp = _context.Districts.ToList();
            //var districts = await _unitOfWork.Districts.GetAllAsync();
            //var municipalities = await _unitOfWork.Municipalities.GetAllAsync();


            //var districtsWithTheirMunicipalities = districts
            //    .Select(d => new
            //    {
            //        d.Id,
            //        d.Name,
            //        d.Code,
            //        MunicipalityName = municipalities.FirstOrDefault(m => m.Id == d.MunicipalityId)?.Name
            //    }).ToList();
            return Ok(await _districtService.GetDistricts());
            // return Ok(districts);
        }

        [HttpGet]
        [Route("{id:int}")]
        public async Task<IActionResult> GetDistrictById(int id)
        {

            // var district = _unitOfWork.Districts.GetByIdAsync(id);
            return Ok(await _districtService.GetDistrictById(id));
        }

        [HttpPost]
        public async Task<IActionResult> CreateDistrict([FromBody] CreateDistrictDto request)
        {
            // //validations
            // if (request == null)
            // {
            //     return BadRequest("District cannot be null.");
            // }

            // //building objects
            // var district = new District
            // {
            //     Name = request.Name,
            //     Code = request.Code,
            //     MunicipalityId = request.MunicipalityId,
            //     IsActive = true,
            //     CreatedAt = DateTime.UtcNow
            // };

            // // Adding resources
            // //persisting resources

            // //add the district to the repository
            //// await _unitOfWork.BeginTransactionAsync();
            // district = await _unitOfWork.Districts.AddAsync(district);
            // await _unitOfWork.CompleteAsync();
            var responseId = await _districtService.CreateDistrict(request);
            return Ok(new { id = responseId });


        }

        [HttpPut]
        public async Task<IActionResult> UpdateDistrict([FromBody] UpdateDistrictDto request)
        {
            //if (request == null || request.Id <= 0)
            //{
            //    return BadRequest("Invalid district data.");
            //}
            //var existingDistrict = await _unitOfWork.Districts.GetByIdAsync(request.Id);
            //if (existingDistrict == null)
            //{
            //    return NotFound("District not found.");
            //}
            //existingDistrict.Name = request.Name;
            //existingDistrict.Code = request.Code;
            //existingDistrict.MunicipalityId = request.MunicipalityId;
            //existingDistrict.IsActive = request.IsActive;
            //existingDistrict.UpdatedAt = DateTime.UtcNow;

            //_unitOfWork.Districts.Update(existingDistrict);
            //await _unitOfWork.CompleteAsync();
            await _districtService.UpdateDistrict(request); 
            return NoContent();

        }

        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteDistrict(int id)
        {
            //var district = await _unitOfWork.Districts.GetByIdAsync(id);
            //if (district == null)
            //{
            //    return NotFound("District not found.");
            //}
            //_unitOfWork.Districts.Delete(district);
            //await _unitOfWork.CompleteAsync();
            await _districtService.DeleteDistrict(id);
            return NoContent();
        }
    }
}