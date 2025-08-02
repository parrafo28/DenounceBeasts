using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace client_razor.Pages.Sectors;

public class DetailsModel : PageModel
{
    private readonly ISectorService _sectorService;
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<DetailsModel> _logger;

    public DetailsModel(
        ISectorService sectorService,
        IMunicipalityService municipalityService,
        ILogger<DetailsModel> logger)
    {
        _sectorService = sectorService;
        _municipalityService = municipalityService;
        _logger = logger;
    }

    public SectorDto? Sector { get; set; }
    public MunicipalityDto? Municipality { get; set; }
    public IEnumerable<SectorDto> OtherSectors { get; set; } = new List<SectorDto>();

    public async Task<IActionResult> OnGetAsync(int id)
    {
        try
        {
            // Cargar el sector
            Sector = await _sectorService.GetByIdAsync(id);
            if (Sector == null)
            {
                TempData["ErrorMessage"] = "El sector no fue encontrado.";
                return RedirectToPage("Index");
            }

            // Cargar el municipio del sector
            Municipality = await _municipalityService.GetByIdAsync(Sector.MunicipalityId);

            // Cargar otros sectores del mismo municipio
            if (Municipality != null)
            {
                var allSectorsInMunicipality = await _sectorService.GetSectorsByMunicipalityAsync(Municipality.Id);
                OtherSectors = allSectorsInMunicipality.Where(s => s.Id != id).OrderBy(s => s.Name);
            }

            _logger.LogInformation("Loaded sector details for {Id} - {Name} in municipality {MunicipalityName}", 
                id, Sector.Name, Municipality?.Name ?? "Unknown");

            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sector details for {Id}", id);
            TempData["ErrorMessage"] = "Error al cargar los detalles del sector. Por favor, intente nuevamente.";
            return RedirectToPage("Index");
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
                return RedirectToPage("Index");
            }

            var success = await _sectorService.DeleteAsync(id);
            if (success)
            {
                TempData["SuccessMessage"] = $"El sector '{sector.Name}' fue eliminado exitosamente.";
                _logger.LogInformation("Sector {Id} - {Name} deleted successfully from details page", 
                    id, sector.Name);
            }
            else
            {
                TempData["ErrorMessage"] = "No se pudo eliminar el sector.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting sector {Id} from details page", id);
            TempData["ErrorMessage"] = "Error al eliminar el sector. Por favor, intente nuevamente.";
        }

        return RedirectToPage("Index");
    }
}