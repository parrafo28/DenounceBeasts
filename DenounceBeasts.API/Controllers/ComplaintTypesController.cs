using Microsoft.AspNetCore.Mvc;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComplaintTypesController : ControllerBase
    {
        private readonly IComplaintTypeService _complaintTypeService;

        public ComplaintTypesController(IComplaintTypeService complaintTypeService)
        {
            _complaintTypeService = complaintTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComplaintTypeDto>>> GetAll()
        {
            try
            {
                var complaintTypes = await _complaintTypeService.GetAllAsync();
                return Ok(complaintTypes);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ComplaintTypeDto>> GetById(int id)
        {
            try
            {
                var complaintType = await _complaintTypeService.GetByIdAsync(id);
                if (complaintType == null)
                    return NotFound();
                
                return Ok(complaintType);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ComplaintTypeDto>> Create([FromBody] ComplaintTypeDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var complaintType = await _complaintTypeService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = complaintType.Id }, complaintType);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ComplaintTypeDto>> Update(int id, [FromBody] ComplaintTypeDto updateDto)
        {
            try
            {
                if (id != updateDto.Id)
                    return BadRequest("ID mismatch");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var complaintType = await _complaintTypeService.UpdateAsync(updateDto);
                return Ok(complaintType);
            }
            catch (ArgumentException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _complaintTypeService.DeleteAsync(id);
                if (!result)
                    return NotFound();
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ComplaintTypeDto>>> GetActive()
        {
            try
            {
                var complaintTypes = await _complaintTypeService.GetActiveAsync();
                return Ok(complaintTypes);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
}