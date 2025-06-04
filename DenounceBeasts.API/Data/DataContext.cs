using DenounceBeasts.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.API.Data
{
    public class DataContext: DbContext
    {
        public DataContext(DbContextOptions<DataContext> o) : base(o)
        {
        }
        
       
        public DbSet<District> Districts { get; set; } 
        public DbSet<Municipality> Municipalities { get; set; }

    }
}
