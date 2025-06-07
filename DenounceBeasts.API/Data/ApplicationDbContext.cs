using DenounceBeasts.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.API.Data
{
    //is not correct use this name, you need to names like DenounceBeastsDataContext or DenounceBeastsDbContext
    public class ApplicationDbContext: DbContext
    {
         
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Define DbSets for your entities
        public DbSet<Municipality> Municipalities { get; set; }
        public DbSet<Sector> Sectors { get; set; }
         
  

    }
}
