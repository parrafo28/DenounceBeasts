using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.Domain;

public class Municipality : BaseEntity
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

    [Display(Name = "Cantidad de Sectores")]
    public int SectorsCount { get; set; }

    // Navigation properties
    public virtual ICollection<Sector> Sectors { get; set; } = new List<Sector>();
}