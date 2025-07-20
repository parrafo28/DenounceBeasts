using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace client_razor.Pages.Sectors;

public class IndexModel : PageModel
{
    private readonly ISectorService _sectorService;
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(
        ISectorService sectorService,
        IMunicipalityService municipalityService,
        ILogger<IndexModel> logger)
    {
        _sectorService = sectorService;
        _municipalityService = municipalityService;
        _logger = logger;
    }

    public IEnumerable<SectorDto> Sectors { get; set; } = new List<SectorDto>();
    public IEnumerable<MunicipalityDto> Municipalities { get; set; } = new List<MunicipalityDto>();

    [BindProperty(SupportsGet = true)]
    public string? SearchTerm { get; set; }

    [BindProperty(SupportsGet = true)]
    public int? MunicipalityFilter { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? StatusFilter { get; set; }

    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int InactiveCount { get; set; }
    public int MunicipalitiesWithSectors { get; set; }

    public async Task OnGetAsync()
    {
        try
        {
            // Cargar municipios para el filtro
            Municipalities = await _municipalityService.GetAllAsync();

            // Cargar todos los sectores
            var allSectors = await _sectorService.GetAllAsync();

            // Calcular estadísticas
            TotalCount = allSectors.Count();
            ActiveCount = allSectors.Count(s => s.IsActive);
            InactiveCount = allSectors.Count(s => !s.IsActive);
            MunicipalitiesWithSectors = allSectors.Select(s => s.MunicipalityId).Distinct().Count();

            // Aplicar filtros
            var filteredSectors = allSectors.AsEnumerable();

            // Filtro por término de búsqueda
            if (!string.IsNullOrWhiteSpace(SearchTerm))
            {
                filteredSectors = filteredSectors.Where(s =>
                    s.Name.Contains(SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                    s.Code.Contains(SearchTerm, StringComparison.OrdinalIgnoreCase));
            }

            // Filtro por municipio
            if (MunicipalityFilter.HasValue && MunicipalityFilter.Value > 0)
            {
                filteredSectors = filteredSectors.Where(s => s.MunicipalityId == MunicipalityFilter.Value);
            }

            // Filtro por estado
            if (!string.IsNullOrEmpty(StatusFilter))
            {
                if (StatusFilter == "active")
                {
                    filteredSectors = filteredSectors.Where(s => s.IsActive);
                }
                else if (StatusFilter == "inactive")
                {
                    filteredSectors = filteredSectors.Where(s => !s.IsActive);
                }
            }

            Sectors = filteredSectors.OrderBy(s => s.MunicipalityName).ThenBy(s => s.Name).ToList();

            _logger.LogInformation("Loaded {Count} sectors with filters: SearchTerm='{SearchTerm}', MunicipalityFilter={MunicipalityFilter}, StatusFilter='{StatusFilter}'",
                Sectors.Count(), SearchTerm, MunicipalityFilter, StatusFilter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sectors");
            TempData["ErrorMessage"] = "Error al cargar la lista de sectores. Por favor, intente nuevamente.";
            Sectors = new List<SectorDto>();
            Municipalities = new List<MunicipalityDto>();
        }
    }

    public async Task<IActionResult> OnPostDeleteAsync(int id)
    {
        try
        {
            var sector = await _sectorService.GetByIdAsync(id);
            if (sector == null)
            {
                TempData["ErrorMessage"] = "El sector no fue encontrado.";
                return RedirectToPage();
            }

            var success = await _sectorService.DeleteAsync(id);
            if (success)
            {
                TempData["SuccessMessage"] = $"El sector '{sector.Name}' fue eliminado exitosamente.";
                _logger.LogInformation("Sector {Id} - {Name} deleted successfully", id, sector.Name);
            }
            else
            {
                TempData["ErrorMessage"] = "No se pudo eliminar el sector.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting sector {Id}", id);
            TempData["ErrorMessage"] = "Error al eliminar el sector. Por favor, intente nuevamente.";
        }

        return RedirectToPage();
    }
}