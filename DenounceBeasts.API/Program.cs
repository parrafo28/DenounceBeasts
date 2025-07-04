
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure;
using DenounceBeasts.Infrastructure.Interfaces;
using DenounceBeasts.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<DataContext>(
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionStr"))
    );


// Add services to the container.
////builder.Services.AddTransient<MunicipalityRepository>();
// builder.Services.AddScoped<MunicipalityRepository>();
//////builder.Services.AddSingleton<MunicipalityRepository>();
//builder.Services.AddScoped<DistrictRepository>();
//builder.Services.AddScoped<GenericRepository<Municipality>>();
//builder.Services.AddScoped<UnitOfWork>();
///
//builder.Services.AddScoped<IMunicipalityRepository, MunicipalityRepository>();
builder.Services.AddScoped<IMunicipalityRepository, MunicipalityRepository>();
//builder.Services.AddScoped<IRepository<Municipality>, GenericRepository<Municipality>>();
builder.Services.AddScoped<IDistrictRepository, DistrictRepository>();
//builder.Services.AddScoped<IDistrictRepository, DistrictForzandoTheMingoRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddControllers().AddJsonOptions(options =>
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
