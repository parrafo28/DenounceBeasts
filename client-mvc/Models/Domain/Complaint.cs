using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.Domain;

public enum Priority
{
    [Display(Name = "Baja")]
    Low = 1,
    
    [Display(Name = "Media")]
    Medium = 2,
    
    [Display(Name = "Alta")]
    High = 3,
    
    [Display(Name = "Crítica")]
    Critical = 4
}

public class Complaint : BaseEntity
{
    [Display(Name = "Título")]
    [Required(ErrorMessage = "El título es requerido")]
    [StringLength(200, MinimumLength = 5, ErrorMessage = "El título debe tener entre 5 y 200 caracteres")]
    public string Title { get; set; } = string.Empty;

    [Display(Name = "Descripción")]
    [Required(ErrorMessage = "La descripción es requerida")]
    [StringLength(2000, MinimumLength = 10, ErrorMessage = "La descripción debe tener entre 10 y 2000 caracteres")]
    public string Description { get; set; } = string.Empty;

    [Display(Name = "Dirección")]
    [StringLength(500, ErrorMessage = "La dirección no puede exceder 500 caracteres")]
    public string? Address { get; set; }

    [Display(Name = "Latitud")]
    [Range(-90, 90, ErrorMessage = "La latitud debe estar entre -90 y 90")]
    public double? Latitude { get; set; }

    [Display(Name = "Longitud")]
    [Range(-180, 180, ErrorMessage = "La longitud debe estar entre -180 y 180")]
    public double? Longitude { get; set; }

    [Display(Name = "Prioridad")]
    [Required(ErrorMessage = "Debe seleccionar una prioridad")]
    public Priority Priority { get; set; } = Priority.Medium;

    [Display(Name = "Tipo de Denuncia")]
    [Required(ErrorMessage = "Debe seleccionar un tipo de denuncia")]
    public int ComplaintTypeId { get; set; }

    [Display(Name = "Tipo de Denuncia")]
    public string? ComplaintTypeName { get; set; }

    [Display(Name = "Estado")]
    [Required(ErrorMessage = "Debe seleccionar un estado")]
    public int StatusId { get; set; }

    [Display(Name = "Estado")]
    public string? StatusName { get; set; }

    [Display(Name = "Color del Estado")]
    public string? StatusColor { get; set; }

    [Display(Name = "Municipio")]
    [Required(ErrorMessage = "Debe seleccionar un municipio")]
    public int MunicipalityId { get; set; }

    [Display(Name = "Municipio")]
    public string? MunicipalityName { get; set; }

    [Display(Name = "Sector")]
    public int? SectorId { get; set; }

    [Display(Name = "Sector")]
    public string? SectorName { get; set; }

    [Display(Name = "Usuario")]
    public int? UserId { get; set; }

    [Display(Name = "Usuario")]
    public string? UserFullName { get; set; }

    [Display(Name = "Votos")]
    public int VotesCount { get; set; }

    [Display(Name = "Comentarios")]
    public int CommentsCount { get; set; }

    // Navigation properties
    public virtual ComplaintType? ComplaintType { get; set; }
    public virtual Status? Status { get; set; }
    public virtual Municipality? Municipality { get; set; }
    public virtual Sector? Sector { get; set; }
}