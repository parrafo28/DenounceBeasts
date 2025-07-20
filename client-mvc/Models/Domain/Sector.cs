using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.Domain;

public class Sector : BaseEntity
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

    [Display(Name = "Nombre del Municipio")]
    public string? MunicipalityName { get; set; }

    [Display(Name = "Código del Municipio")]
    public string? MunicipalityCode { get; set; }

    [Display(Name = "Cantidad de Denuncias")]
    public int ComplaintsCount { get; set; }

    // Navigation properties
    public virtual Municipality? Municipality { get; set; }
}