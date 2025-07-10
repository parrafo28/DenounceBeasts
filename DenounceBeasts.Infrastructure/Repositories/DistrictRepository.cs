using DenounceBeasts.Domain.Contracts.Repositories;
using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Data.Repositories
{
    public class DistrictRepository : GenericRepository<District>, IDistrictRepository
    {
        private readonly DataContext _context;

        public DistrictRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<District>> GetDistrictsWithMunicipalties()
        {
            return await _context.Districts
                .Include(d => d.Municipality)
                .ToListAsync();
        }

        public async Task<List<District>> GetDistrictsByMunicipalityId(int municipalityId)
        {
            return await _context.Districts
                .Where(d => d.MunicipalityId == municipalityId)
                .ToListAsync();
        }


    }
}
