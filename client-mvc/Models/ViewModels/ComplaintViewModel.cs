using DenounceBeasts.WebClient.Models.Domain;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.ViewModels;

public class ComplaintListViewModel
{
    public IEnumerable<Complaint> Complaints { get; set; } = new List<Complaint>();
    public IEnumerable<SelectListItem> Municipalities { get; set; } = new List<SelectListItem>();
    public IEnumerable<SelectListItem> ComplaintTypes { get; set; } = new List<SelectListItem>();
    public IEnumerable<SelectListItem> Statuses { get; set; } = new List<SelectListItem>();
    
    public string? SearchQuery { get; set; }
    public int? MunicipalityFilter { get; set; }
    public int? ComplaintTypeFilter { get; set; }
    public int? StatusFilter { get; set; }
    public Priority? PriorityFilter { get; set; }
    
    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int ResolvedCount { get; set; }
    public int PendingCount { get; set; }
}

public class ComplaintCreateViewModel
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

    [Display(Name = "Municipio")]
    [Required(ErrorMessage = "Debe seleccionar un municipio")]
    public int MunicipalityId { get; set; }

    [Display(Name = "Sector")]
    public int? SectorId { get; set; }

    public IEnumerable<SelectListItem> ComplaintTypes { get; set; } = new List<SelectListItem>();
    public IEnumerable<SelectListItem> Municipalities { get; set; } = new List<SelectListItem>();
    public IEnumerable<SelectListItem> Sectors { get; set; } = new List<SelectListItem>();
    public IEnumerable<SelectListItem> Priorities { get; set; } = new List<SelectListItem>();
}

public class ComplaintEditViewModel : ComplaintCreateViewModel
{
    public int Id { get; set; }
    
    [Display(Name = "Estado")]
    [Required(ErrorMessage = "Debe seleccionar un estado")]
    public int StatusId { get; set; }
    
    [Display(Name = "Fecha de Creación")]
    public DateTime CreatedAt { get; set; }
    
    [Display(Name = "Fecha de Actualización")]
    public DateTime? UpdatedAt { get; set; }
    
    [Display(Name = "Votos")]
    public int VotesCount { get; set; }
    
    [Display(Name = "Comentarios")]
    public int CommentsCount { get; set; }

    public IEnumerable<SelectListItem> Statuses { get; set; } = new List<SelectListItem>();
}

public class ComplaintDetailsViewModel
{
    public Complaint Complaint { get; set; } = new();
    public Municipality Municipality { get; set; } = new();
    public Sector? Sector { get; set; }
    public ComplaintType ComplaintType { get; set; } = new();
    public Status Status { get; set; } = new();
    
    // Statistics
    public int VotesUpCount { get; set; }
    public int VotesDownCount { get; set; }
    public int CommentsCount { get; set; }
    
    // Related complaints
    public IEnumerable<Complaint> RelatedComplaints { get; set; } = new List<Complaint>();
}