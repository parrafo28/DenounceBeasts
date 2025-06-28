using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Repositories
{
    public class MunicipaltyRepository
    {
        private readonly ApplicationDbContext _context;

        public MunicipaltyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Municipality>> GetAllMunicipalitiesAsync()
        {
            return await _context.Municipalities.ToListAsync();
        }

        public async Task<List<Municipality>> GetAllMunicipalitiesWithSectorsAsync()
        {
            return await _context.Municipalities
                .Include(m => m.Sectors)
                .ToListAsync();
        }

        public async Task<Municipality?> GetMunicipalityByIdAsync(int id)
        {
            return await _context.Municipalities.Include(m => m.Sectors)
                .FirstOrDefaultAsync(m => m.Id == id);
        }
        public async Task<Municipality> AddMunicipalityAsync(Municipality municipality)
        {
            _context.Municipalities.Add(municipality);
            await _context.SaveChangesAsync();
            return municipality;
        }
        public async Task<Municipality> UpdateMunicipalityAsync(Municipality municipality)
        {
            _context.Entry(municipality).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return municipality;
        }
        public async Task<bool> DeleteMunicipalityAsync(int id)
        {
            var municipality = await _context.Municipalities.FindAsync(id);
            if (municipality == null)
            {
                return false;  
            }
            _context.Municipalities.Remove(municipality);
            await _context.SaveChangesAsync();
            return true;  
        }

    }
}
