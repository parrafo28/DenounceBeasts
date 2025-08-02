using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace client_razor.Pages.Municipalities;

public class EditModel : PageModel
{
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<EditModel> _logger;

    public EditModel(IMunicipalityService municipalityService, ILogger<EditModel> logger)
    {
        _municipalityService = municipalityService;
        _logger = logger;
    }

    [BindProperty]
    public int Id { get; set; }

    [BindProperty]
    public EditMunicipalityInputModel Municipality { get; set; } = new();

    public MunicipalityDto OriginalMunicipality { get; set; } = new();

    public async Task<IActionResult> OnGetAsync(int id)
    {
        try
        {
            var municipality = await _municipalityService.GetByIdAsync(id);
            if (municipality == null)
            {
                TempData["ErrorMessage"] = "El municipio no fue encontrado.";
                return RedirectToPage("Index");
            }

            Id = id;
            OriginalMunicipality = municipality;
            Municipality = new EditMunicipalityInputModel
            {
                Code = municipality.Code,
                Name = municipality.Name,
                IsActive = municipality.IsActive
            };

            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading municipality {Id} for editing", id);
            TempData["ErrorMessage"] = "Error al cargar el municipio. Por favor, intente nuevamente.";
            return RedirectToPage("Index");
        }
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            // Recargar datos originales para mostrar en la vista
            try
            {
                OriginalMunicipality = await _municipalityService.GetByIdAsync(Id) ?? new MunicipalityDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reloading municipality {Id} after validation failure", Id);
            }
            return Page();
        }

        try
        {
            // Verificar si el código es único (excluyendo el municipio actual)
            var isCodeUnique = await _municipalityService.IsCodeUniqueAsync(Municipality.Code, Id);
            if (!isCodeUnique)
            {
                ModelState.AddModelError("Municipality.Code", "Ya existe otro municipio con este código.");
                OriginalMunicipality = await _municipalityService.GetByIdAsync(Id) ?? new MunicipalityDto();
                return Page();
            }

            // Actualizar el municipio
            var updateDto = new UpdateMunicipalityDto
            {
                Code = Municipality.Code.Trim(),
                Name = Municipality.Name.Trim(),
                IsActive = Municipality.IsActive
            };

            var updatedMunicipality = await _municipalityService.UpdateAsync(Id, updateDto);

            TempData["SuccessMessage"] = $"El municipio '{updatedMunicipality.Name}' fue actualizado exitosamente.";
            _logger.LogInformation("Municipality updated successfully: {Id} - {Name}", Id, updatedMunicipality.Name);

            return RedirectToPage("Index");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating municipality {Id}", Id);
            TempData["ErrorMessage"] = "Error al actualizar el municipio. Por favor, intente nuevamente.";
            
            try
            {
                OriginalMunicipality = await _municipalityService.GetByIdAsync(Id) ?? new MunicipalityDto();
            }
            catch (Exception loadEx)
            {
                _logger.LogError(loadEx, "Error reloading municipality {Id} after update failure", Id);
            }
            
            return Page();
        }
    }

    public class EditMunicipalityInputModel
    {
        [Required(ErrorMessage = "El código es requerido")]
        [StringLength(10, MinimumLength = 2, ErrorMessage = "El código debe tener entre 2 y 10 caracteres")]
        [Display(Name = "Código")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        [Display(Name = "Nombre")]
        public string Name { get; set; } = string.Empty;

        [Display(Name = "Municipio activo")]
        public bool IsActive { get; set; }
    }
}