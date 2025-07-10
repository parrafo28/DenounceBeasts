using DenounceBeasts.Domain.Contracts.Repositories;
using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Data.Repositories
{
    public class MunicipaltyFolzandoElMingoRepository: GenericRepository<Municipality> , IMunicipaltyRepository
    {
        private readonly DataContext _context;

        public MunicipaltyFolzandoElMingoRepository(DataContext context): base(context)  
        {
            _context = context;
        }

        public async Task<List<Municipality>> GetMunicipaltiesWithDistricts()
        {
            Console.WriteLine("Folzando the Mingo");
            return await _context.Municipalities
                .Include(d => d.Districts)
                .ToListAsync();
        }
          
         
    }
}
