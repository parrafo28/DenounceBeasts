using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;
using DenounceBeasts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Repositories
{
    public class MunicipalityForzandoTheMingoRepository : GenericRepository<Municipality>, IMunicipalityRepository
    {
        private readonly ApplicationDbContext _context;

        public MunicipalityForzandoTheMingoRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
         
        public async Task<List<Municipality>> GetAllMunicipalitiesWithSectorsAsync()
        {
            return await _context.Municipalities
                .Include(m => m.Sectors)
                .ToListAsync();
        }

        public async Task<Municipality?> GetMunicipalityWithSectorsByIdAsync(int id)
        {
            return await _context.Municipalities.Include(m => m.Sectors)
                .FirstOrDefaultAsync(m => m.Id == id);
        }



        //public async Task SaveChangesAsync()
        //{
        //    await _context.SaveChangesAsync();
        //}

    }
}
