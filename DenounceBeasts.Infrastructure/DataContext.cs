using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Infrastructure.Data
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
