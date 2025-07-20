using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.Domain;

public class Status : BaseEntity
{
    [Display(Name = "Nombre")]
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 50 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Display(Name = "Descripción")]
    [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
    public string? Description { get; set; }

    [Display(Name = "Color")]
    [Required(ErrorMessage = "El color es requerido")]
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "El color debe ser un código hexadecimal válido (ej: #FF0000)")]
    public string Color { get; set; } = "#007bff";

    [Display(Name = "Cantidad de Denuncias")]
    public int ComplaintsCount { get; set; }
}