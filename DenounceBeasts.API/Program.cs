
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Data;
using DenounceBeasts.Infrastructure.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<DataContext>(
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionStr"))
    );


// Add services to the container.
//builder.Services.AddTransient<MunicipalityRepository>();
 builder.Services.AddScoped<MunicipalityRepository>();
////builder.Services.AddSingleton<MunicipalityRepository>();
builder.Services.AddScoped<DistrictRepository>();
builder.Services.AddScoped<GenericRepository<Municipality>>();
///


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
