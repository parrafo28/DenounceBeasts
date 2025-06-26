using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Data.Repositories
{
    public class MunicipaltyRepository: GenericRepository<Municipality> 
    {
        private readonly DataContext _context;

        public MunicipaltyRepository(DataContext context): base(context)  
        {
            _context = context;
        }

        public async Task<List<Municipality>> GetMunicipaltiesWithDistricts()
        {
            return await _context.Municipalities
                .Include(d => d.Districts)
                .ToListAsync();
        }
          
         
    }
}
