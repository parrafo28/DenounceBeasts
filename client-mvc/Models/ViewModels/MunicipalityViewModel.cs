using DenounceBeasts.WebClient.Models.Domain;
using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.ViewModels;

public class MunicipalityListViewModel
{
    public IEnumerable<Municipality> Municipalities { get; set; } = new List<Municipality>();
    public string? SearchQuery { get; set; }
    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int InactiveCount { get; set; }
}

public class MunicipalityCreateViewModel
{
    [Display(Name = "Nombre")]
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Display(Name = "Código")]
    [Required(ErrorMessage = "El código es requerido")]
    [StringLength(10, MinimumLength = 2, ErrorMessage = "El código debe tener entre 2 y 10 caracteres")]
    [RegularExpression(@"^[A-Z0-9-]+$", ErrorMessage = "El código debe contener solo letras mayúsculas, números y guiones")]
    public string Code { get; set; } = string.Empty;

    [Display(Name = "Activo")]
    public bool IsActive { get; set; } = true;
}

public class MunicipalityEditViewModel : MunicipalityCreateViewModel
{
    public int Id { get; set; }
    
    [Display(Name = "Fecha de Creación")]
    public DateTime CreatedAt { get; set; }
    
    [Display(Name = "Fecha de Actualización")]
    public DateTime? UpdatedAt { get; set; }
    
    [Display(Name = "Cantidad de Sectores")]
    public int SectorsCount { get; set; }
}

public class MunicipalityDetailsViewModel
{
    public Municipality Municipality { get; set; } = new();
    public IEnumerable<Sector> Sectors { get; set; } = new List<Sector>();
    public int ActiveSectorsCount { get; set; }
    public int InactiveSectorsCount { get; set; }
    public int ComplaintsCount { get; set; }
}