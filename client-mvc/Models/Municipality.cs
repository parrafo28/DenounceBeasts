using System.ComponentModel.DataAnnotations;

namespace ClientMvc.Models
{
    // Modelo que representa un Municipio
    public class Municipality
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El código es requerido")]
        [StringLength(10, ErrorMessage = "El código no puede exceder 10 caracteres")]
        public string Code { get; set; } = string.Empty;
        
        [Display(Name = "Activo")]
        public bool IsActive { get; set; } = true;
        
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}