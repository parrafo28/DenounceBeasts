using DenounceBeasts.Domain.Contracts.Repositories;
using DenounceBeasts.Domain.Entities;
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
builder.Services.AddTransient<UnitOfWork>();
builder.Services.AddTransient<IMunicipaltyRepository, MunicipaltyRepository>();

// add service in transient lifetime this means that a new instance of the service will be created every time it is requested
//builder.Services.AddTransient<DistrictRepository>();
// add service in singleton lifetime this means that a single instance of the service will be created and shared across the application
//builder.Services.AddSingleton<DistrictRepository>();

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

app.UseAuthorization();

app.MapControllers();

app.Run();
