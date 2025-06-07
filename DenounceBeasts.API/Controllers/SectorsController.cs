using DenounceBeasts.API.Data;
using DenounceBeasts.API.DTOs;
using DenounceBeasts.API.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    //[Route("api/Sectors")]
    [Route("api/[controller]")]
    public class SectorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SectorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Sectors
        [HttpGet]
        public IActionResult GetSectors()
        {
            var sectors = _context.Sectors.ToList();

            var sectorsResponse = new List<SectorDto>();

            //foreach (var s in sectors)
            //{

            //    var sectorDto = new SectorDto
            //    {
            //        Id = s.Id,
            //        Code = s.Code,
            //        Name = s.Name,
            //        MunicipalityId = s.MunicipalityId
            //    };
            //    sectorsResponse.Add(sectorDto);
            //}

            sectorsResponse = sectors.Select(s => new SectorDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                MunicipalityId = s.MunicipalityId
            }).ToList();
             
            return Ok(sectorsResponse);
        }

        // GET: api/Sectors/5
        [HttpGet("{id}")]
        public IActionResult GetSector(int id)
        {
            //Sector sector = new Sector();
            //var sector = new Sector();
            // Sector sector;
            // var sector;
            //foreach (var item in _sectors)
            //{
            //    if (item.Id == id)
            //    {
            //        sector = item;
            //        //  return Ok(sector);
            //        break;
            //    }
            //}
            //sector = _sectors.FirstOrDefault(s => s.Id == id);
            var sector = _context.Sectors.Where(s => s.Id == id).FirstOrDefault();
            if (sector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            var sectorResponse = new SectorDto
            {
                Id = sector.Id,
                Code = sector.Code,
                Name = sector.Name,
                MunicipalityId = sector.MunicipalityId
            };
            return Ok(sectorResponse); 
        }

        // POST: api/Sectors
        [HttpPost]
        public IActionResult CreateSector([FromBody] CreateSectorDto request)
        {
            if (request == null)
            {
                return BadRequest("Sector cannot be null.");
            }
            //  sector.Id = _sectors.Max(s => s.Id) + 1; 
            // sector.Id = _sectors.Count() + 1;

            var sector = new Sector
            {
                Code = request.Code,
                CreatedAt = DateTime.Now,
                MunicipalityId = request.MunicipalityId,
                Name = request.Name,
            };
            _context.Sectors.Add(sector);
            _context.SaveChanges();
            return Ok(new { id = sector.Id });

        }

        //[HttpPut]
        //public IActionResult UpdateSector([FromBody] Sector sector)
        //{
        //    if (sector == null  )
        //    {
        //        return BadRequest("Sector is null or ID mismatch.");
        //    }
        //    var existingSector = _sectors.FirstOrDefault(s => s.Id == sector.Id);
        //    if (existingSector == null)
        //    {
        //        return NotFound($"Sector with ID {sector.Id} not found.");
        //    }
        //    existingSector.Name = sector.Name;
        //    existingSector.Code = sector.Code;
        //    existingSector.UpdatedAt = DateTime.Now;
        //    //return Ok(existingSector);
        //    return Ok(_sectors);
        //}
        //// PUT: api/Sectors/5

        [HttpPut("{id}")]
        public IActionResult UpdateSector(int id, [FromBody] UpdateSectorDto request)
        {
            if (request == null || request.Id != id)
            {
                return BadRequest("Sector is null or ID mismatch.");
            }
            var existingSector = _context.Sectors.FirstOrDefault(s => s.Id == id);
            if (existingSector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            existingSector.Name = request.Name;
            existingSector.Code = request.Code;
            existingSector.UpdatedAt = DateTime.Now;
            existingSector.MunicipalityId = request.MunicipalityId;
            _context.Sectors.Update(existingSector);
            _context.SaveChanges();
            // return Ok(existingSector);
            return NoContent();
        }

        // DELETE: api/Sectors/5
        [HttpDelete("{id}")]
        public IActionResult DeleteSector(int id)
        {
            var sector = _context.Sectors.FirstOrDefault(s => s.Id == id);
            if (sector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            _context.Sectors.Remove(sector);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
