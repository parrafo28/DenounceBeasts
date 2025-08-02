using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace client_razor.Pages.Municipalities;

public class IndexModel : PageModel
{
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(IMunicipalityService municipalityService, ILogger<IndexModel> logger)
    {
        _municipalityService = municipalityService;
        _logger = logger;
    }

    public IEnumerable<MunicipalityDto> Municipalities { get; set; } = new List<MunicipalityDto>();
    
    [BindProperty(SupportsGet = true)]
    public string? SearchTerm { get; set; }
    
    [BindProperty(SupportsGet = true)]
    public string? StatusFilter { get; set; }

    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int InactiveCount { get; set; }

    public async Task OnGetAsync()
    {
        try
        {
            var allMunicipalities = await _municipalityService.GetAllAsync();
            
            // Calcular estadísticas
            TotalCount = allMunicipalities.Count();
            ActiveCount = allMunicipalities.Count(m => m.IsActive);
            InactiveCount = allMunicipalities.Count(m => !m.IsActive);

            // Aplicar filtros
            var filteredMunicipalities = allMunicipalities.AsEnumerable();

            // Filtro por término de búsqueda
            if (!string.IsNullOrWhiteSpace(SearchTerm))
            {
                filteredMunicipalities = filteredMunicipalities.Where(m =>
                    m.Name.Contains(SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                    m.Code.Contains(SearchTerm, StringComparison.OrdinalIgnoreCase));
            }

            // Filtro por estado
            if (!string.IsNullOrEmpty(StatusFilter))
            {
                if (StatusFilter == "active")
                {
                    filteredMunicipalities = filteredMunicipalities.Where(m => m.IsActive);
                }
                else if (StatusFilter == "inactive")
                {
                    filteredMunicipalities = filteredMunicipalities.Where(m => !m.IsActive);
                }
            }

            Municipalities = filteredMunicipalities.OrderBy(m => m.Name).ToList();

            _logger.LogInformation("Loaded {Count} municipalities with filters: SearchTerm='{SearchTerm}', StatusFilter='{StatusFilter}'", 
                Municipalities.Count(), SearchTerm, StatusFilter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading municipalities");
            TempData["ErrorMessage"] = "Error al cargar la lista de municipios. Por favor, intente nuevamente.";
            Municipalities = new List<MunicipalityDto>();
        }
    }

    public async Task<IActionResult> OnPostDeleteAsync(int id)
    {
        try
        {
            var municipality = await _municipalityService.GetByIdAsync(id);
            if (municipality == null)
            {
                TempData["ErrorMessage"] = "El municipio no fue encontrado.";
                return RedirectToPage();
            }

            var success = await _municipalityService.DeleteAsync(id);
            if (success)
            {
                TempData["SuccessMessage"] = $"El municipio '{municipality.Name}' fue eliminado exitosamente.";
                _logger.LogInformation("Municipality {Id} - {Name} deleted successfully", id, municipality.Name);
            }
            else
            {
                TempData["ErrorMessage"] = "No se pudo eliminar el municipio.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting municipality {Id}", id);
            TempData["ErrorMessage"] = "Error al eliminar el municipio. Por favor, intente nuevamente.";
        }

        return RedirectToPage();
    }
}