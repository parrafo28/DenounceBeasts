using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.Domain;

public abstract class BaseEntity
{
    public int Id { get; set; }
    
    [Display(Name = "Fecha de Creación")]
    public DateTime CreatedAt { get; set; }
    
    [Display(Name = "Fecha de Actualización")]
    public DateTime? UpdatedAt { get; set; }
    
    [Display(Name = "Activo")]
    public bool IsActive { get; set; } = true;
}