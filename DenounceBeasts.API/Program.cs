using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.Mapping;
using DenounceBeasts.Application.Services;
using DenounceBeasts.Domain.Contracts;
using DenounceBeasts.Domain.Contracts.Repositories;
using DenounceBeasts.Infrastructure.Data;
using DenounceBeasts.Infrastructure.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<DataContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// add service in scoped lifetime this means that a new instance of the service will be created for each request
//builder.Services.AddScoped<DistrictRepository>();
//builder.Services.AddScoped<IMunicipaltyRepository, MunicipaltyRepository>();
//builder.Services.AddScoped<IMunicipaltyRepository, MunicipaltyFolzandoElMingoRepository>();
builder.Services.AddTransient<IDistrictRepository, DistrictRepository>();
builder.Services.AddTransient<IUnitOfWork, UnitOfWork>();
builder.Services.AddTransient<IMunicipaltyRepository, MunicipaltyRepository>();
builder.Services.AddTransient<IDistrictService, DistrictService>();

//var key = builder.Configuration["AutomapperLicenceKey"];
var automapperKey = builder.Configuration["KeysConfigurations:AutomapperLicenceKey"];
//builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddAutoMapper(cfg => cfg.LicenseKey
= automapperKey, typeof(MappingProfile));

//var allowedOrigins = new string[]
//{
//    "https://localhost:3000", // URL del frontend en desarrollo
//    "http://localhost:3000"   // URL del frontend en desarrollo sin HTTPS
//};
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowLocalhost", policy =>
//    {
//        policy.WithOrigins(allowedOrigins)
//              .AllowAnyMethod()
//              .AllowAnyHeader();
//    });
//});
// Configuración de CORS para permitir acceso desde el frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowEverybody", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Fixed: AddJsonOptions should be called on IMvcBuilder, not IServiceCollection
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable CORS for all requests
app.UseCors("AllowEverybody");

app.UseAuthorization();

app.MapControllers();

app.Run();
