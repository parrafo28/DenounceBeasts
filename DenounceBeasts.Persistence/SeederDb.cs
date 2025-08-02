using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DenounceBeasts.Persistence
{
    public static class SeederDb
    {
        public static void SeedData(ModelBuilder modelBuilder)
        {
            // Fixed date for all seed data to avoid EF Core migration issues
            var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            
            // Seed roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", NormalizedName = "ADMIN", Description = "Administrator role with full access", CreatedAt = seedDate, IsActive = true },
                new Role { Id = 2, Name = "Staff", NormalizedName = "STAFF", Description = "Staff role with limited administrative access", CreatedAt = seedDate, IsActive = true },
                new Role { Id = 3, Name = "User", NormalizedName = "USER", Description = "Regular user role", CreatedAt = seedDate, IsActive = true }
            );

            // Seed status
            modelBuilder.Entity<Status>().HasData(
                new Status { Id = 1, Name = "Pending", Description = "The complaint is pending review", Color = "#FFC107", CreatedAt = seedDate, IsActive = true },
                new Status { Id = 2, Name = "In Progress", Description = "The complaint is being addressed", Color = "#2196F3", CreatedAt = seedDate, IsActive = true },
                new Status { Id = 3, Name = "Resolved", Description = "The complaint has been resolved", Color = "#4CAF50", CreatedAt = seedDate, IsActive = true },
                new Status { Id = 4, Name = "Rejected", Description = "The complaint has been rejected", Color = "#F44336", CreatedAt = seedDate, IsActive = true }
            );

            // Seed complaint types
            modelBuilder.Entity<ComplaintType>().HasData(
                new ComplaintType { Id = 1, Name = "Road Issue", Description = "Issues related to roads, potholes, etc.", Icon = "fa-road", CreatedAt = seedDate, IsActive = true },
                new ComplaintType { Id = 2, Name = "Waste Management", Description = "Issues related to garbage collection, etc.", Icon = "fa-trash", CreatedAt = seedDate, IsActive = true },
                new ComplaintType { Id = 3, Name = "Water Supply", Description = "Issues related to water supply", Icon = "fa-tint", CreatedAt = seedDate, IsActive = true },
                new ComplaintType { Id = 4, Name = "Electricity", Description = "Issues related to electricity supply", Icon = "fa-bolt", CreatedAt = seedDate, IsActive = true },
                new ComplaintType { Id = 5, Name = "Public Safety", Description = "Issues related to public safety", Icon = "fa-shield-alt", CreatedAt = seedDate, IsActive = true },
                new ComplaintType { Id = 6, Name = "Other", Description = "Other issues not covered by other types", Icon = "fa-question-circle", CreatedAt = seedDate, IsActive = true }
            );

            // Sample municipality and districts
            modelBuilder.Entity<Municipality>().HasData(
                new Municipality { Id = 1, Name = "Santo Domingo", Code = "SD", CreatedAt = seedDate, IsActive = true }
            );

            modelBuilder.Entity<Sector>().HasData(
                new Sector { Id = 1, Name = "Distrito Nacional", Code = "DN", MunicipalityId = 1, CreatedAt = seedDate, IsActive = true },
                new Sector { Id = 2, Name = "Santo Domingo Este", Code = "SDE", MunicipalityId = 1, CreatedAt = seedDate, IsActive = true },
                new Sector { Id = 3, Name = "Santo Domingo Norte", Code = "SDN", MunicipalityId = 1, CreatedAt = seedDate, IsActive = true },
                new Sector { Id = 4, Name = "Santo Domingo Oeste", Code = "SDO", MunicipalityId = 1, CreatedAt = seedDate, IsActive = true }
            );

            // NUEVO: Seed admin user
            // NOTA: En un entorno de producción, el password debería ser más seguro y configurado desde variables de entorno
            // Hash BCrypt.Net-Next generado correctamente para "Admin123!"
            var adminPasswordHash = "$2a$11$3BudctoP/lZj6bnw6mQUreruBG6FD7zVfVtFPPsDDDyeJSqyoUZOG"; // Password: "Admin123!"

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FirstName = "Administrador",
                    LastName = "Sistema",
                    Email = "admin@denuncia.do",
                    NickName = "admin",
                    PasswordHash = adminPasswordHash, // Hash de "Admin123!"
                    IsAnonymous = false,
                    Picture = "/img/admin-avatar.png",
                    DeviceId = "SYSTEM",
                    CreatedAt = seedDate,
                    IsActive = true
                }
            );

            // Seed admin user profile
            modelBuilder.Entity<UserProfile>().HasData(
                new UserProfile
                {
                    Id = 1,
                    UserId = 1,
                    Address = "Oficina Central, Santo Domingo",
                    Phone = "+1 809-555-0001",
                    Identification = "ADMIN-001",
                    Bio = "Administrador del sistema Denuncia.Do",
                    CreatedAt = seedDate,
                    IsActive = true
                }
            );

            // Assign admin role to admin user
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole
                {
                    Id = 1,
                    UserId = 1,
                    RoleId = 1, // Admin role
                    CreatedAt = seedDate,
                    IsActive = true
                }
            );

            // OPCIONAL: Crear algunos usuarios de ejemplo para pruebas
            // Hash BCrypt.Net-Next generado correctamente para "User123!"
            var userPasswordHash = "$2a$11$XWF8VXckIcKXXxf3J3Is1O0ytW1it7FZk5PDojD4KDuP3zz/DK7cu"; // Password: "User123!"

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 2,
                    FirstName = "Juan",
                    LastName = "Pérez",
                    Email = "juan.perez@example.com",
                    NickName = "juanperez",
                    PasswordHash = userPasswordHash,
                    Picture = "/images/complaints/pothole-sample.jpg",
                    IsAnonymous = false,
                    DeviceId = "DEVICE-001",
                    CreatedAt = seedDate,
                    IsActive = true
                },
                new User
                {
                    Id = 3,
                    FirstName = "María",
                    LastName = "González",
                    Email = "maria.gonzalez@example.com",
                    NickName = "mariagonzalez",
                    Picture = "/images/complaints/pothole-sample.jpg",
                    PasswordHash = userPasswordHash,
                    IsAnonymous = false,
                    DeviceId = "DEVICE-002",
                    CreatedAt = seedDate,
                    IsActive = true
                }
            );

            // Seed user profiles for example users
            modelBuilder.Entity<UserProfile>().HasData(
                new UserProfile
                {
                    Id = 2,
                    UserId = 2,
                    Address = "Calle Principal #123, Santo Domingo Este",
                    Phone = "+1 809-555-0002",
                    Identification = "001-0123456-7",
                    Bio = "Ciudadano activo preocupado por su comunidad",
                    CreatedAt = seedDate,
                    IsActive = true
                },
                new UserProfile
                {
                    Id = 3,
                    UserId = 3,
                    Address = "Av. Winston Churchill #456, Distrito Nacional",
                    Phone = "+1 809-555-0003",
                    Identification = "001-0234567-8",
                    Bio = "Vecina comprometida con el mejoramiento del barrio",
                    CreatedAt = seedDate,
                    IsActive = true
                }
            );

            // Assign user role to example users
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole
                {
                    Id = 2,
                    UserId = 2,
                    RoleId = 3, // User role
                    CreatedAt = seedDate,
                    IsActive = true
                },
                new UserRole
                {
                    Id = 3,
                    UserId = 3,
                    RoleId = 3, // User role
                    CreatedAt = seedDate,
                    IsActive = true
                }
            );

            // OPCIONAL: Crear algunas denuncias de ejemplo
            modelBuilder.Entity<Complaint>().HasData(
                new Complaint
                {
                    Id = 1,
                    Title = "Bache en la Avenida 27 de Febrero",
                    Description = "Hay un bache muy grande en la Avenida 27 de Febrero que está causando daños a los vehículos",
                    Detail = "El bache se encuentra exactamente frente al Centro Comercial Blue Mall. Mide aproximadamente 2 metros de largo por 1 metro de ancho y tiene una profundidad considerable. Varios conductores han reportado daños en sus neumáticos.",
                    Address = "Av. 27 de Febrero, frente a Blue Mall",
                    Latitude = 18.4765d,
                    Longitude = -69.9399d,
                    Image = "/images/complaints/pothole-sample.jpg",
                    UserId = 2,
                    ComplaintTypeId = 1, // Road Issue
                    StatusId = 1, // Pending
                    SectorId = 1, // Distrito Nacional
                    CreatedAt = seedDate.AddDays(-5),
                    IsActive = true
                },
                new Complaint
                {
                    Id = 2,
                    Title = "Problema con la recolección de basura",
                    Description = "La basura no se ha recogido en nuestra calle durante más de una semana",
                    Detail = "Los contenedores están desbordados y la basura se está acumulando en las aceras. Esto está creando problemas de higiene y malos olores en todo el vecindario. Hemos contactado al ayuntamiento pero no hemos recibido respuesta.",
                    Address = "Calle José Martí #45-67, Los Alcarrizos",
                    Latitude = 18.5051d,
                    Longitude = -70.0051d,
                    Image = "/images/complaints/waste-sample.jpg",
                    UserId = 3,
                    ComplaintTypeId = 2, // Waste Management
                    StatusId = 2, // In Progress
                    SectorId = 4, // Santo Domingo Oeste
                    CreatedAt = seedDate.AddDays(-3),
                    IsActive = true
                }
            );

            // Crear historial para las denuncias de ejemplo
            modelBuilder.Entity<ComplaintHistory>().HasData(
                new ComplaintHistory
                {
                    Id = 1,
                    ComplaintId = 1,
                    UserId = 2,
                    StatusId = 1,
                    Comments = "Denuncia creada por el ciudadano",
                    CreatedAt = seedDate.AddDays(-5),
                    IsActive = true
                },
                new ComplaintHistory
                {
                    Id = 2,
                    ComplaintId = 2,
                    UserId = 3,
                    StatusId = 1,
                    Comments = "Denuncia creada por el ciudadano",
                    CreatedAt = seedDate.AddDays(-3),
                    IsActive = true
                },
                new ComplaintHistory
                {
                    Id = 3,
                    ComplaintId = 2,
                    UserId = 1, // Admin user
                    StatusId = 2,
                    Comments = "Denuncia asignada al departamento de servicios públicos para revisión",
                    CreatedAt = seedDate.AddDays(-2),
                    IsActive = true
                }
            );
        }

    }
}
