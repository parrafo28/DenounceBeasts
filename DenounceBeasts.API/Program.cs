using DenounceBeasts.Infrastructure;
using DenounceBeasts.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("MainConnection")));

// Add services to the container.
//with singleton you can use the same instance of the repository in all controllers
//builder.Services.AddSingleton<MunicipaltyRepository>();
////with transient you can use a new instance of the repository in each controller
//builder.Services.AddTransient<MunicipaltyRepository>();
//with scoped you can use a new instance of the repository in each request
builder.Services.AddScoped<MunicipaltyRepository>();
builder.Services.AddScoped<SectorRepository>();

builder.Services.AddControllers()
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
