using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.Mapping;
using DenounceBeasts.Application.Services;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;
using DenounceBeasts.Infrastructure.Repositories;
using DenounceBeasts.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("MainConnection")));

// Add services to the container.
//with singleton you can use the same instance of the repository in all controllers
//builder.Services.AddSingleton<MunicipalityRepository>();
////with transient you can use a new instance of the repository in each controller
//builder.Services.AddTransient<MunicipalityRepository>();
//with scoped you can use a new instance of the repository in each request
//builder.Services.AddTransient<UnitOfWork>();
//builder.Services.AddTransient<MunicipalityRepository>();
//builder.Services.AddTransient<SectorRepository>();
//builder.Services.AddTransient<GenericRepository<Status>>();

//string[] authorizedOrigins = ["https:localhost:8705", "https:localhost:8709"];
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowSpecificOrigins",
//        builder => builder.WithOrigins(authorizedOrigins)
//                          .AllowAnyMethod()
//                          .AllowAnyHeader()
//                          .AllowCredentials());
//});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

// Repository registrations
builder.Services.AddScoped<UnitOfWork>();
builder.Services.AddScoped<MunicipalityRepository>();
builder.Services.AddScoped<SectorRepository>();
builder.Services.AddScoped<GenericRepository<Status>>();
builder.Services.AddScoped<GenericRepository<Complaint>>();
builder.Services.AddScoped<GenericRepository<User>>();
builder.Services.AddScoped<GenericRepository<ComplaintType>>();
builder.Services.AddScoped<GenericRepository<Comment>>();
builder.Services.AddScoped<GenericRepository<Vote>>();
builder.Services.AddScoped<GenericRepository<Attachment>>();
builder.Services.AddScoped<GenericRepository<Role>>();
builder.Services.AddScoped<GenericRepository<UserRole>>();
builder.Services.AddScoped<GenericRepository<Notification>>();
builder.Services.AddScoped<GenericRepository<ComplaintHistory>>();
builder.Services.AddScoped<GenericRepository<UserProfile>>();

// Interface registrations
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IMunicipalityRepository, MunicipalityForzandoTheMingoRepository>();
builder.Services.AddScoped<ISectorRepository, SectorRepository>();
builder.Services.AddScoped<IRepository<Status>, GenericRepository<Status>>();
builder.Services.AddScoped<IRepository<Complaint>, GenericRepository<Complaint>>();
builder.Services.AddScoped<IRepository<User>, GenericRepository<User>>();
builder.Services.AddScoped<IRepository<ComplaintType>, GenericRepository<ComplaintType>>();
builder.Services.AddScoped<IRepository<Comment>, GenericRepository<Comment>>();
builder.Services.AddScoped<IRepository<Vote>, GenericRepository<Vote>>();
builder.Services.AddScoped<IRepository<Attachment>, GenericRepository<Attachment>>();
builder.Services.AddScoped<IRepository<Role>, GenericRepository<Role>>();
builder.Services.AddScoped<IRepository<UserRole>, GenericRepository<UserRole>>();
builder.Services.AddScoped<IRepository<Notification>, GenericRepository<Notification>>();
builder.Services.AddScoped<IRepository<ComplaintHistory>, GenericRepository<ComplaintHistory>>();
builder.Services.AddScoped<IRepository<UserProfile>, GenericRepository<UserProfile>>();

// Service registrations
builder.Services.AddScoped<ISectorService, SectorService>();
builder.Services.AddScoped<IMunicipalityService, MunicipalityService>();
builder.Services.AddScoped<IComplaintService, ComplaintService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<IComplaintTypeService, ComplaintTypeService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var automapperLicence = builder.Configuration.GetSection("KeysConfigurations:AutomapperLicenceKey").Value;
var automapperLicence2 = builder.Configuration.GetSection("AutomapperLicenceKey").Value;
//builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);
builder.Services.AddAutoMapper(cfg => cfg.LicenseKey = automapperLicence, typeof(MappingProfile));

// Configure JWT Authentication
var jwtSecretKey = builder.Configuration.GetSection("JwtSettings:SecretKey").Value;
if (string.IsNullOrEmpty(jwtSecretKey))
{
    throw new InvalidOperationException("JWT SecretKey is not configured in appsettings");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration.GetSection("JwtSettings:Issuer").Value ?? "DenounceBeasts",
        ValidAudience = builder.Configuration.GetSection("JwtSettings:Audience").Value ?? "DenounceBeasts-Users",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Administrador"));
    options.AddPolicy("ModeratorOrAdmin", policy => policy.RequireRole("Moderador", "Administrador"));
});

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

app.UseCors("AllowAllOrigins");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
