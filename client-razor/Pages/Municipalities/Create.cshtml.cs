using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace client_razor.Pages.Municipalities;

public class CreateModel : PageModel
{
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<CreateModel> _logger;

    public CreateModel(IMunicipalityService municipalityService, ILogger<CreateModel> logger)
    {
        _municipalityService = municipalityService;
        _logger = logger;
    }

    [BindProperty]
    public CreateMunicipalityInputModel Municipality { get; set; } = new();

    public void OnGet()
    {
        // Inicializar con valores por defecto
        Municipality = new CreateMunicipalityInputModel
        {
            IsActive = true
        };
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            return Page();
        }

        try
        {
            // Verificar si el código es único
            var isCodeUnique = await _municipalityService.IsCodeUniqueAsync(Municipality.Code);
            if (!isCodeUnique)
            {
                ModelState.AddModelError("Municipality.Code", "Ya existe un municipio con este código.");
                return Page();
            }

            // Crear el municipio
            var createDto = new CreateMunicipalityDto
            {
                Code = Municipality.Code.Trim(),
                Name = Municipality.Name.Trim(),
                IsActive = Municipality.IsActive
            };

            var createdMunicipality = await _municipalityService.CreateAsync(createDto);

            TempData["SuccessMessage"] = $"El municipio '{createdMunicipality.Name}' fue creado exitosamente.";
            _logger.LogInformation("Municipality created successfully: {Id} - {Name}", createdMunicipality.Id, createdMunicipality.Name);

            return RedirectToPage("Index");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating municipality with code: {Code}", Municipality.Code);
            TempData["ErrorMessage"] = "Error al crear el municipio. Por favor, intente nuevamente.";
            return Page();
        }
    }

    public class CreateMunicipalityInputModel
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
        public bool IsActive { get; set; } = true;
    }
}