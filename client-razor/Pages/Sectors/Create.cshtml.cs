using client_razor.Models;
using client_razor.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace client_razor.Pages.Sectors;

public class CreateModel : PageModel
{
    private readonly ISectorService _sectorService;
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<CreateModel> _logger;

    public CreateModel(
        ISectorService sectorService,
        IMunicipalityService municipalityService,
        ILogger<CreateModel> logger)
    {
        _sectorService = sectorService;
        _municipalityService = municipalityService;
        _logger = logger;
    }

    [BindProperty]
    public CreateSectorInputModel Sector { get; set; } = new();

    public IEnumerable<MunicipalityDto> Municipalities { get; set; } = new List<MunicipalityDto>();

    [BindProperty(SupportsGet = true)]
    public int? PreselectedMunicipalityId { get; set; }

    public async Task OnGetAsync(int? municipalityId = null)
    {
        try
        {
            // Cargar municipios para el dropdown
            Municipalities = await _municipalityService.GetAllAsync();

            // Si viene un municipio preseleccionado desde la página de detalles del municipio
            PreselectedMunicipalityId = municipalityId;
            
            // Inicializar con valores por defecto
            Sector = new CreateSectorInputModel
            {
                MunicipalityId = municipalityId ?? 0,
                IsActive = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading data for sector creation");
            TempData["ErrorMessage"] = "Error al cargar los datos necesarios. Por favor, intente nuevamente.";
            Municipalities = new List<MunicipalityDto>();
        }
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            // Recargar municipios para el dropdown
            Municipalities = await _municipalityService.GetAllAsync();
            return Page();
        }

        try
        {
            // Verificar si el código es único dentro del municipio
            var isCodeUnique = await _sectorService.IsCodeUniqueInMunicipalityAsync(
                Sector.Code, Sector.MunicipalityId);
            
            if (!isCodeUnique)
            {
                ModelState.AddModelError("Sector.Code", 
                    "Ya existe un sector con este código en el municipio seleccionado.");
                Municipalities = await _municipalityService.GetAllAsync();
                return Page();
            }

            // Crear el sector
            var createDto = new CreateSectorDto
            {
                Code = Sector.Code.Trim(),
                Name = Sector.Name.Trim(),
                MunicipalityId = Sector.MunicipalityId,
                IsActive = Sector.IsActive
            };

            var createdSector = await _sectorService.CreateAsync(createDto);

            TempData["SuccessMessage"] = $"El sector '{createdSector.Name}' fue creado exitosamente.";
            _logger.LogInformation("Sector created successfully: {Id} - {Name} in municipality {MunicipalityId}", 
                createdSector.Id, createdSector.Name, createdSector.MunicipalityId);

            return RedirectToPage("Index");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sector with code: {Code}", Sector.Code);
            TempData["ErrorMessage"] = "Error al crear el sector. Por favor, intente nuevamente.";
            
            // Recargar municipios para el dropdown
            Municipalities = await _municipalityService.GetAllAsync();
            return Page();
        }
    }

    public class CreateSectorInputModel
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
        public bool IsActive { get; set; } = true;
    }
}