using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ComplaintsController : ControllerBase
    {
        private readonly IComplaintService _complaintService;

        public ComplaintsController(IComplaintService complaintService)
        {
            _complaintService = complaintService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> GetAll()
        {
            try
            {
                var complaints = await _complaintService.GetAllAsync();
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ComplaintDto>> GetById(int id)
        {
            try
            {
                var complaint = await _complaintService.GetByIdAsync(id);
                if (complaint == null)
                    return NotFound();
                
                return Ok(complaint);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost]
      //  [Authorize]
        public async Task<ActionResult<ComplaintDto>> Create([FromBody] CreateComplaintDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var complaint = await _complaintService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = complaint.Id }, complaint);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
      //  [Authorize]
        public async Task<ActionResult<ComplaintDto>> Update(int id, [FromBody] UpdateComplaintDto updateDto)
        {
            try
            {
                if (id != updateDto.Id)
                    return BadRequest("ID mismatch");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var complaint = await _complaintService.UpdateAsync(updateDto);
                return Ok(complaint);
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
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _complaintService.DeleteAsync(id);
                if (!result)
                    return NotFound();
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
      //  [Authorize]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> GetByUserId(int userId)
        {
            try
            {
                var complaints = await _complaintService.GetByUserIdAsync(userId);
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("status/{statusId}")]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> GetByStatusId(int statusId)
        {
            try
            {
                var complaints = await _complaintService.GetByStatusIdAsync(statusId);
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("type/{complaintTypeId}")]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> GetByComplaintTypeId(int complaintTypeId)
        {
            try
            {
                var complaints = await _complaintService.GetByComplaintTypeIdAsync(complaintTypeId);
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("sector/{sectorId}")]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> GetBySectorId(int sectorId)
        {
            try
            {
                var complaints = await _complaintService.GetBySectorIdAsync(sectorId);
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("location")]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> GetByLocation(
            [FromQuery] double latitude, 
            [FromQuery] double longitude, 
            [FromQuery] double radiusKm = 5.0)
        {
            try
            {
                var complaints = await _complaintService.GetByLocationAsync(latitude, longitude, radiusKm);
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost("{id}/status")]
        [Authorize(Policy = "ModeratorOrAdmin")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var result = await _complaintService.UpdateStatusAsync(id, request.StatusId, request.Comments, request.UserId);
                if (!result)
                    return NotFound();
                
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("count")]
        public async Task<ActionResult<int>> GetTotalCount()
        {
            try
            {
                var count = await _complaintService.GetTotalCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("paged")]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> GetPaged(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var complaints = await _complaintService.GetPagedAsync(pageNumber, pageSize);
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ComplaintDto>>> Search([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return BadRequest("Search term is required");

                var complaints = await _complaintService.SearchAsync(searchTerm);
                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }

    public class UpdateStatusRequest
    {
        public int StatusId { get; set; }
        public string Comments { get; set; }
        public int? UserId { get; set; }
    }
}