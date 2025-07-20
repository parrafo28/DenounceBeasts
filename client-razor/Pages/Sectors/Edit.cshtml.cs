using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace client_razor.Pages.Sectors;

public class EditModel : PageModel
{
    private readonly ISectorService _sectorService;
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<EditModel> _logger;

    public EditModel(
        ISectorService sectorService,
        IMunicipalityService municipalityService,
        ILogger<EditModel> logger)
    {
        _sectorService = sectorService;
        _municipalityService = municipalityService;
        _logger = logger;
    }

    [BindProperty]
    public int Id { get; set; }

    [BindProperty]
    public EditSectorInputModel Sector { get; set; } = new();

    public SectorDto OriginalSector { get; set; } = new();
    public IEnumerable<MunicipalityDto> Municipalities { get; set; } = new List<MunicipalityDto>();

    public async Task<IActionResult> OnGetAsync(int id)
    {
        try
        {
            var sector = await _sectorService.GetByIdAsync(id);
            if (sector == null)
            {
                TempData["ErrorMessage"] = "El sector no fue encontrado.";
                return RedirectToPage("Index");
            }

            // Cargar municipios para el dropdown
            Municipalities = await _municipalityService.GetAllAsync();

            Id = id;
            OriginalSector = sector;
            Sector = new EditSectorInputModel
            {
                MunicipalityId = sector.MunicipalityId,
                Code = sector.Code,
                Name = sector.Name,
                IsActive = sector.IsActive
            };

            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sector {Id} for editing", id);
            TempData["ErrorMessage"] = "Error al cargar el sector. Por favor, intente nuevamente.";
            return RedirectToPage("Index");
        }
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            // Recargar datos para mostrar en la vista
            try
            {
                OriginalSector = await _sectorService.GetByIdAsync(Id) ?? new SectorDto();
                Municipalities = await _municipalityService.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reloading data after validation failure for sector {Id}", Id);
            }
            return Page();
        }

        try
        {
            // Verificar si el código es único dentro del municipio (excluyendo el sector actual)
            var isCodeUnique = await _sectorService.IsCodeUniqueInMunicipalityAsync(
                Sector.Code, Sector.MunicipalityId, Id);
            
            if (!isCodeUnique)
            {
                ModelState.AddModelError("Sector.Code", 
                    "Ya existe otro sector con este código en el municipio seleccionado.");
                OriginalSector = await _sectorService.GetByIdAsync(Id) ?? new SectorDto();
                Municipalities = await _municipalityService.GetAllAsync();
                return Page();
            }

            // Actualizar el sector
            var updateDto = new UpdateSectorDto
            {
                Code = Sector.Code.Trim(),
                Name = Sector.Name.Trim(),
                MunicipalityId = Sector.MunicipalityId,
                IsActive = Sector.IsActive
            };

            var updatedSector = await _sectorService.UpdateAsync(Id, updateDto);

            TempData["SuccessMessage"] = $"El sector '{updatedSector.Name}' fue actualizado exitosamente.";
            _logger.LogInformation("Sector updated successfully: {Id} - {Name}", Id, updatedSector.Name);

            return RedirectToPage("Index");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sector {Id}", Id);
            TempData["ErrorMessage"] = "Error al actualizar el sector. Por favor, intente nuevamente.";
            
            try
            {
                OriginalSector = await _sectorService.GetByIdAsync(Id) ?? new SectorDto();
                Municipalities = await _municipalityService.GetAllAsync();
            }
            catch (Exception loadEx)
            {
                _logger.LogError(loadEx, "Error reloading data after update failure for sector {Id}", Id);
            }
            
            return Page();
        }
    }

    public class EditSectorInputModel
    {
        [Required(ErrorMessage = "El municipio es requerido")]
        [Display(Name = "Municipio")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un municipio")]
        public int MunicipalityId { get; set; }

        [Required(ErrorMessage = "El código es requerido")]
        [StringLength(10, MinimumLength = 2, ErrorMessage = "El código debe tener entre 2 y 10 caracteres")]
        [Display(Name = "Código")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        [Display(Name = "Nombre")]
        public string Name { get; set; } = string.Empty;

        [Display(Name = "Sector activo")]
        public bool IsActive { get; set; }
    }
}