using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    [Route("api/status")]
    [AllowAnonymous]
    public class StatusController : ControllerBase
    {
        private readonly IStatusService _statusService;

        public StatusController(IStatusService statusService)
        {
            _statusService = statusService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusDto>>> GetAll()
        {
            try
            {
                var statuses = await _statusService.GetAllAsync();
                return Ok(statuses);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StatusDto>> GetById(int id)
        {
            try
            {
                var status = await _statusService.GetByIdAsync(id);
                if (status == null)
                    return NotFound();
                
                return Ok(status);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<StatusDto>> Create([FromBody] StatusDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var status = await _statusService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = status.Id }, status);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<StatusDto>> Update(int id, [FromBody] StatusDto updateDto)
        {
            try
            {
                if (id != updateDto.Id)
                    return BadRequest("ID mismatch");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var status = await _statusService.UpdateAsync(updateDto);
                return Ok(status);
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
                var result = await _statusService.DeleteAsync(id);
                if (!result)
                    return NotFound();
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
}