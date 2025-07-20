using DenounceBeasts.WebClient.Models.Domain;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.ViewModels;

public class SectorListViewModel
{
    public IEnumerable<Sector> Sectors { get; set; } = new List<Sector>();
    public IEnumerable<SelectListItem> Municipalities { get; set; } = new List<SelectListItem>();
    public string? SearchQuery { get; set; }
    public int? MunicipalityFilter { get; set; }
    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int InactiveCount { get; set; }
}

public class SectorCreateViewModel
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

    [Display(Name = "Municipio")]
    [Required(ErrorMessage = "Debe seleccionar un municipio")]
    public int MunicipalityId { get; set; }

    [Display(Name = "Activo")]
    public bool IsActive { get; set; } = true;

    public IEnumerable<SelectListItem> Municipalities { get; set; } = new List<SelectListItem>();
}

public class SectorEditViewModel : SectorCreateViewModel
{
    public int Id { get; set; }
    
    [Display(Name = "Fecha de Creación")]
    public DateTime CreatedAt { get; set; }
    
    [Display(Name = "Fecha de Actualización")]
    public DateTime? UpdatedAt { get; set; }
    
    [Display(Name = "Nombre del Municipio")]
    public string? MunicipalityName { get; set; }
    
    [Display(Name = "Cantidad de Denuncias")]
    public int ComplaintsCount { get; set; }
}

public class SectorDetailsViewModel
{
    public Sector Sector { get; set; } = new();
    public Municipality Municipality { get; set; } = new();
    public int ComplaintsCount { get; set; }
    public int RecentComplaintsCount { get; set; }
}