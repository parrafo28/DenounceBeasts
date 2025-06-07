using DenounceBeasts.API.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.API.Controllers
{
    [ApiController]
    //[Route("api/Sectors")]
    [Route("api/[controller]")]
    public class SectorsController : ControllerBase
    {
        private List<Sector> _sectors;

        public SectorsController()
        {
            _sectors = new List<Sector>();
            _sectors.Add(new Sector { Id = 1, Name = "Sector1", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now });
            _sectors.Add(new Sector { Id = 2, Name = "Sector2", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now });
            _sectors.Add(new Sector { Id = 3, Name = "Sector3", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now });

        }

        // GET: api/Sectors
        [HttpGet]
        public IActionResult GetSectors()
        {
            return Ok(_sectors);
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
            var sector = _sectors.Where(s => s.Id == id).FirstOrDefault();
            if (sector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            return Ok(sector);
        }

        // POST: api/Sectors
        [HttpPost]
        public IActionResult CreateSector([FromBody] Sector sector  )
        {
            if (sector == null)
            {
                return BadRequest("Sector cannot be null.");
            }
            //  sector.Id = _sectors.Max(s => s.Id) + 1; 
            // sector.Id = _sectors.Count() + 1;
            sector.Id = _sectors.Count + 1;
            sector.CreatedAt = DateTime.Now;
            _sectors.Add(sector);
            //return CreatedAtAction(nameof(GetSector), new { id = sector.Id }, sector);
            return Ok(_sectors);

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
        public IActionResult UpdateSector(int id, [FromBody] Sector sector)
        {
            if (sector == null || sector.Id != id)
            {
                return BadRequest("Sector is null or ID mismatch.");
            }
            var existingSector = _sectors.FirstOrDefault(s => s.Id == id);
            if (existingSector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            existingSector.Name = sector.Name;
            existingSector.Code = sector.Code;
            existingSector.UpdatedAt = DateTime.Now;
           // return Ok(existingSector);
            return Ok(_sectors);
        }

        // DELETE: api/Sectors/5
        [HttpDelete("{id}")]
        public IActionResult DeleteSector(int id)
        {
            var sector = _sectors.FirstOrDefault(s => s.Id == id);
            if (sector == null)
            {
                return NotFound($"Sector with ID {id} not found.");
            }
            _sectors.Remove(sector);
            // return NoContent();
            return Ok(_sectors);
        }
    }
}
