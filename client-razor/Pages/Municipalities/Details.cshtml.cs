using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace client_razor.Pages.Municipalities;

public class DetailsModel : PageModel
{
    private readonly IMunicipalityService _municipalityService;
    private readonly ISectorService _sectorService;
    private readonly ILogger<DetailsModel> _logger;

    public DetailsModel(
        IMunicipalityService municipalityService, 
        ISectorService sectorService,
        ILogger<DetailsModel> logger)
    {
        _municipalityService = municipalityService;
        _sectorService = sectorService;
        _logger = logger;
    }

    public MunicipalityDto? Municipality { get; set; }
    public IEnumerable<SectorDto> Sectors { get; set; } = new List<SectorDto>();
    public int ActiveSectorsCount { get; set; }
    public int InactiveSectorsCount { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        try
        {
            Municipality = await _municipalityService.GetByIdAsync(id);
            if (Municipality == null)
            {
                TempData["ErrorMessage"] = "El municipio no fue encontrado.";
                return RedirectToPage("Index");
            }

            // Cargar sectores del municipio
            Sectors = await _sectorService.GetSectorsByMunicipalityAsync(id);
            
            // Calcular estadísticas de sectores
            ActiveSectorsCount = Sectors.Count(s => s.IsActive);
            InactiveSectorsCount = Sectors.Count(s => !s.IsActive);

            _logger.LogInformation("Loaded municipality details for {Id} - {Name} with {SectorsCount} sectors", 
                id, Municipality.Name, Sectors.Count());

            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading municipality details for {Id}", id);
            TempData["ErrorMessage"] = "Error al cargar los detalles del municipio. Por favor, intente nuevamente.";
            return RedirectToPage("Index");
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
                return RedirectToPage("Index");
            }

            var success = await _municipalityService.DeleteAsync(id);
            if (success)
            {
                TempData["SuccessMessage"] = $"El municipio '{municipality.Name}' fue eliminado exitosamente.";
                _logger.LogInformation("Municipality {Id} - {Name} deleted successfully from details page", 
                    id, municipality.Name);
            }
            else
            {
                TempData["ErrorMessage"] = "No se pudo eliminar el municipio.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting municipality {Id} from details page", id);
            TempData["ErrorMessage"] = "Error al eliminar el municipio. Por favor, intente nuevamente.";
        }

        return RedirectToPage("Index");
    }
}