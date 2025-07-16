using System.ComponentModel.DataAnnotations;

namespace ClientBlazor.Models
{
    /// <summary>
    /// Modelo que representa un Distrito en Blazor
    /// </summary>
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
        
        /// <summary>
        /// Método para validar el modelo
        /// </summary>
        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(Name) && 
                   !string.IsNullOrWhiteSpace(Code) && 
                   MunicipalityId > 0 &&
                   Name.Length <= 100 && 
                   Code.Length <= 10;
        }
        
        /// <summary>
        /// Método para obtener una representación string del distrito
        /// </summary>
        public override string ToString()
        {
            return $"{Name} ({Code}) - {MunicipalityName}";
        }
    }
}