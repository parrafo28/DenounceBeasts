using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;
using DenounceBeasts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Repositories
{
    public class MunicipalityRepository : GenericRepository<Municipality>, IMunicipalityRepository
    {
        private readonly ApplicationDbContext _context;

        public MunicipalityRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        //public async Task<List<Municipality>> GetAllMunicipalitiesAsync()
        //{
        //    return await _context.Municipalities.ToListAsync();
        //}
        //public async Task<Municipality?> GetMunicipalityByIdAsync(int id)
        //{
        //    return await _context.Municipalities
        //        .FirstOrDefaultAsync(m => m.Id == id);
        //}
        //public async Task<Municipality> AddMunicipalityAsync(Municipality municipality)
        //{
        //    _context.Municipalities.Add(municipality);
        //    // await _context.SaveChangesAsync();
        //    return municipality;
        //}
        //public async Task<Municipality> UpdateMunicipalityAsync(Municipality municipality)
        //{
        //    //_context.Entry(municipality).State = EntityState.Modified;
        //    _context.Municipalities.Update(municipality);
        //    //  await _context.SaveChangesAsync();
        //    return municipality;
        //}
        //public async Task<bool> DeleteMunicipalityAsync(int id)
        //{
        //    var municipality = await _context.Municipalities.FindAsync(id);
        //    if (municipality == null)
        //    {
        //        return false;
        //    }
        //    _context.Municipalities.Remove(municipality);
        //    //  await _context.SaveChangesAsync();
        //    return true;
        //}


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
