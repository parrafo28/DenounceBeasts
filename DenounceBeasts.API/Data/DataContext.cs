using DenounceBeasts.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> o) : base(o)
        {
        }

        public DbSet<Municipality> Municipalities { get; set; }
        public DbSet<District> Districts { get; set; }

        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{
        //    modelBuilder.Entity<Municipality>().ToTable("Municipalities");
        //    modelBuilder.Entity<District>().ToTable("Districts");
        //    // Configuración de relaciones y restricciones adicionales si es necesario
        //    modelBuilder.Entity<District>()
        //        .HasOne(d => d.Municipality)
        //        .WithMany(m => m.Districts)
        //        .HasForeignKey(d => d.MunicipalityId);
        //}
    }
}
