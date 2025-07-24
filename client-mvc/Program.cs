using DenounceBeasts.WebClient.Services;
using DenounceBeasts.WebClient.Models.Configuration;
using FluentValidation.AspNetCore;
using Serilog;
using Polly;
using Polly.Extensions.Http;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/denouncebeasts-webclient-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllersWithViews()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
    })
    .AddFluentValidation(fv =>
    {
        fv.RegisterValidatorsFromAssemblyContaining<Program>();
        fv.ImplicitlyValidateChildProperties = true;
    });

// Configure API settings
builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection("ApiSettings"));

// Configure HttpClient with Polly
var retryPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
        onRetry: (outcome, timespan, retryCount, context) =>
        {
            Log.Warning("Retry {RetryCount} for {OperationKey} in {Delay}ms", 
                retryCount, context.OperationKey, timespan.TotalMilliseconds);
        });

var timeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(30);

builder.Services.AddHttpClient<IApiService, ApiService>(client =>
{
    var apiSettings = builder.Configuration.GetSection("ApiSettings").Get<ApiSettings>();
    client.BaseAddress = new Uri(apiSettings?.BaseUrl ?? "https://localhost:7175");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "DenounceBeasts-WebClient/1.0");
})
.AddPolicyHandler(retryPolicy)
.AddPolicyHandler(timeoutPolicy);

// Register services
builder.Services.AddScoped<IMunicipalityService, MunicipalityService>();
builder.Services.AddScoped<ISectorService, SectorService>();
builder.Services.AddScoped<IComplaintTypeService, ComplaintTypeService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<IComplaintService, ComplaintService>();

// Authentication services
builder.Services.AddHttpClient<IAuthService, AuthService>(client =>
{
    var apiSettings = builder.Configuration.GetSection("ApiSettings").Get<ApiSettings>();
    client.BaseAddress = new Uri(apiSettings?.BaseUrl ?? "https://localhost:7175");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "DenounceBeasts-WebClient/1.0");
})
.AddPolicyHandler(retryPolicy)
.AddPolicyHandler(timeoutPolicy);

builder.Services.AddScoped<IAuthService, AuthService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Memory cache
builder.Services.AddMemoryCache();

// Session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Configure JSON options for API responses
builder.Services.Configure<JsonSerializerOptions>(options =>
{
    options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.PropertyNameCaseInsensitive = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseSession();

// Add authentication support
app.UseAuthentication();
app.UseAuthorization();

// Configure authentication paths
app.UseStatusCodePagesWithRedirects("/Auth/AccessDenied?statusCode={0}");

// Configure routes
app.MapControllerRoute(
    name: "auth",
    pattern: "auth/{action=Login}",
    defaults: new { controller = "Auth" });

app.MapControllerRoute(
    name: "municipalities",
    pattern: "municipalities/{action=Index}/{id?}",
    defaults: new { controller = "Municipalities" });

app.MapControllerRoute(
    name: "sectors",
    pattern: "sectors/{action=Index}/{id?}",
    defaults: new { controller = "Sectors" });

app.MapControllerRoute(
    name: "complaints",
    pattern: "complaints/{action=Index}/{id?}",
    defaults: new { controller = "Complaints" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Seed initial data if needed
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("DenounceBeasts Web Client starting up...");
}

app.Run();

public partial class Program { }