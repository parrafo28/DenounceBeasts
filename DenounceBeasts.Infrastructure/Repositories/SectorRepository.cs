using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Repositories
{
    public class SectorRepository
    {
        private readonly ApplicationDbContext _context;

        public SectorRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<List<Sector>> GetSectorWithTheirMunicipaltyAsync()
        {
            return await _context.Sectors.Include(p=>p.Municipality)
                .Where(s => s.IsActive).ToListAsync();
        }

        public async Task<List<Sector>> GetAllSectorsAsync()
        {
            return await _context.Sectors.Where(s => s.IsActive)
                .ToListAsync();
        }

        public async Task<List<Sector>> GetSectorsByMunicipalityId(int municipalityId)
        {
            return await _context.Sectors.Where(s => s.IsActive && s.MunicipalityId == municipalityId
            )
                .ToListAsync();
        }
        public async Task<Sector?> GetSectorByIdAsync(int id)
        {
            return await _context.Sectors.FindAsync(id);
        }
        public async Task<Sector> AddSectorAsync(Sector sector)
        {
            _context.Sectors.Add(sector);
            await _context.SaveChangesAsync();
            return sector;
        }
        public async Task<Sector> UpdateSectorAsync(Sector sector)
        {
            _context.Entry(sector).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return sector;
        }
        public async Task<bool> DeleteSectorAsync(int id)
        {
            var sector = await _context.Sectors.FindAsync(id);
            if (sector == null)
            {
                return false;  
            }
            _context.Sectors.Remove(sector);
            await _context.SaveChangesAsync();
            return true;  
        }


    }
}
