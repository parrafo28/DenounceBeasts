using System.ComponentModel.DataAnnotations;

namespace ClientRazor.Models
{
    // Modelo que representa un Distrito en Razor Pages
    public class District
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        [Display(Name = "Nombre del Distrito")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El código es requerido")]
        [StringLength(10, ErrorMessage = "El código no puede exceder 10 caracteres")]
        [Display(Name = "Código")]
        public string Code { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Debe seleccionar un municipio")]
        [Display(Name = "Municipio")]
        public int MunicipalityId { get; set; }
        
        [Display(Name = "Nombre del Municipio")]
        public string MunicipalityName { get; set; } = string.Empty;
        
        [Display(Name = "Estado Activo")]
        public bool IsActive { get; set; } = true;
        
        [Display(Name = "Fecha de Creación")]
        public DateTime? CreatedAt { get; set; }
        
        [Display(Name = "Fecha de Actualización")]
        public DateTime? UpdatedAt { get; set; }
    }
}