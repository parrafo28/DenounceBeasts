using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DenounceBeasts.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedingDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ComplaintTypes",
                columns: new[] { "Id", "CreatedAt", "Description", "Icon", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Issues related to roads, potholes, etc.", "fa-road", true, "Road Issue", null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Issues related to garbage collection, etc.", "fa-trash", true, "Waste Management", null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Issues related to water supply", "fa-tint", true, "Water Supply", null },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Issues related to electricity supply", "fa-bolt", true, "Electricity", null },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Issues related to public safety", "fa-shield-alt", true, "Public Safety", null },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Other issues not covered by other types", "fa-question-circle", true, "Other", null }
                });

            migrationBuilder.InsertData(
                table: "Municipalities",
                columns: new[] { "Id", "Code", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[] { 1, "SD", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, "Santo Domingo", null });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name", "NormalizedName", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Administrator role with full access", true, "Admin", "ADMIN", null },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Staff role with limited administrative access", true, "Staff", "STAFF", null },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Regular user role", true, "User", "USER", null }
                });

            migrationBuilder.InsertData(
                table: "Status",
                columns: new[] { "Id", "Color", "CreatedAt", "Description", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "#FFC107", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "The complaint is pending review", true, "Pending", null },
                    { 2, "#2196F3", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "The complaint is being addressed", true, "In Progress", null },
                    { 3, "#4CAF50", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "The complaint has been resolved", true, "Resolved", null },
                    { 4, "#F44336", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "The complaint has been rejected", true, "Rejected", null }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Address", "CreatedAt", "DeviceId", "Email", "FirstName", "IsActive", "IsAnonymous", "LastName", "NickName", "PasswordHash", "Phone", "Picture", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "SYSTEM", "admin@denuncia.do", "Administrador", true, false, "Sistema", "admin", "$2a$11$3BudctoP/lZj6bnw6mQUreruBG6FD7zVfVtFPPsDDDyeJSqyoUZOG", null, "/img/admin-avatar.png", null },
                    { 2, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "DEVICE-001", "juan.perez@example.com", "Juan", true, false, "Pérez", "juanperez", "$2a$11$XWF8VXckIcKXXxf3J3Is1O0ytW1it7FZk5PDojD4KDuP3zz/DK7cu", null, "/images/complaints/pothole-sample.jpg", null },
                    { 3, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "DEVICE-002", "maria.gonzalez@example.com", "María", true, false, "González", "mariagonzalez", "$2a$11$XWF8VXckIcKXXxf3J3Is1O0ytW1it7FZk5PDojD4KDuP3zz/DK7cu", null, "/images/complaints/pothole-sample.jpg", null }
                });

            migrationBuilder.InsertData(
                table: "Sectors",
                columns: new[] { "Id", "Code", "CreatedAt", "IsActive", "MunicipalityId", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "DN", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, "Distrito Nacional", null },
                    { 2, "SDE", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, "Santo Domingo Este", null },
                    { 3, "SDN", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, "Santo Domingo Norte", null },
                    { 4, "SDO", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, "Santo Domingo Oeste", null }
                });

            migrationBuilder.InsertData(
                table: "UserProfiles",
                columns: new[] { "Id", "Address", "Bio", "BirthDate", "CreatedAt", "Identification", "IsActive", "Phone", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { 1, "Oficina Central, Santo Domingo", "Administrador del sistema Denuncia.Do", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "ADMIN-001", true, "+1 809-555-0001", null, 1 },
                    { 2, "Calle Principal #123, Santo Domingo Este", "Ciudadano activo preocupado por su comunidad", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "001-0123456-7", true, "+1 809-555-0002", null, 2 },
                    { 3, "Av. Winston Churchill #456, Distrito Nacional", "Vecina comprometida con el mejoramiento del barrio", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "001-0234567-8", true, "+1 809-555-0003", null, 3 }
                });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "Id", "CreatedAt", "IsActive", "RoleId", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, null, 1 },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 3, null, 2 },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 3, null, 3 }
                });

            migrationBuilder.InsertData(
                table: "Complaints",
                columns: new[] { "Id", "Address", "ComplaintTypeId", "CreatedAt", "Description", "Detail", "Image", "IsActive", "Latitude", "Longitude", "SectorId", "StatusId", "Title", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { 1, "Av. 27 de Febrero, frente a Blue Mall", 1, new DateTime(2024, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Hay un bache muy grande en la Avenida 27 de Febrero que está causando daños a los vehículos", "El bache se encuentra exactamente frente al Centro Comercial Blue Mall. Mide aproximadamente 2 metros de largo por 1 metro de ancho y tiene una profundidad considerable. Varios conductores han reportado daños en sus neumáticos.", "/images/complaints/pothole-sample.jpg", true, 18.476500000000001, -69.939899999999994, 1, 1, "Bache en la Avenida 27 de Febrero", null, 2 },
                    { 2, "Calle José Martí #45-67, Los Alcarrizos", 2, new DateTime(2024, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "La basura no se ha recogido en nuestra calle durante más de una semana", "Los contenedores están desbordados y la basura se está acumulando en las aceras. Esto está creando problemas de higiene y malos olores en todo el vecindario. Hemos contactado al ayuntamiento pero no hemos recibido respuesta.", "/images/complaints/waste-sample.jpg", true, 18.505099999999999, -70.005099999999999, 4, 2, "Problema con la recolección de basura", null, 3 }
                });

            migrationBuilder.InsertData(
                table: "ComplaintHistories",
                columns: new[] { "Id", "Comments", "ComplaintId", "CreatedAt", "IsActive", "StatusId", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { 1, "Denuncia creada por el ciudadano", 1, new DateTime(2024, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, null, 2 },
                    { 2, "Denuncia creada por el ciudadano", 2, new DateTime(2024, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, null, 3 },
                    { 3, "Denuncia asignada al departamento de servicios públicos para revisión", 2, new DateTime(2024, 12, 30, 0, 0, 0, 0, DateTimeKind.Utc), true, 2, null, 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ComplaintHistories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ComplaintHistories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ComplaintHistories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ComplaintTypes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ComplaintTypes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "ComplaintTypes",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "ComplaintTypes",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Status",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Status",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ComplaintTypes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ComplaintTypes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Status",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Status",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Municipalities",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
