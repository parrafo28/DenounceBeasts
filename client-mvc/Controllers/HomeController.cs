using DenounceBeasts.WebClient.Services;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace DenounceBeasts.WebClient.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IMunicipalityService _municipalityService;
    private readonly ISectorService _sectorService;
    private readonly IComplaintService _complaintService;

    public HomeController(
        ILogger<HomeController> logger,
        IMunicipalityService municipalityService,
        ISectorService sectorService,
        IComplaintService complaintService)
    {
        _logger = logger;
        _municipalityService = municipalityService;
        _sectorService = sectorService;
        _complaintService = complaintService;
    }

    public async Task<IActionResult> Index()
    {
        try
        {
            // Get dashboard statistics
            var municipalities = await _municipalityService.GetAllAsync();
            var sectors = await _sectorService.GetAllAsync();
            var complaints = await _complaintService.GetAllAsync();

            var dashboardData = new
            {
                TotalMunicipalities = municipalities.Count(),
                ActiveMunicipalities = municipalities.Count(m => m.IsActive),
                TotalSectors = sectors.Count(),
                ActiveSectors = sectors.Count(s => s.IsActive),
                TotalComplaints = complaints.Count(),
                ActiveComplaints = complaints.Count(c => c.IsActive),
                RecentComplaints = complaints
                    .Where(c => c.CreatedAt >= DateTime.Now.AddDays(-7))
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(5)
                    .ToList()
            };

            ViewBag.DashboardData = dashboardData;
            return View();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading dashboard data");
            return View();
        }
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

public class ErrorViewModel
{
    public string? RequestId { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}