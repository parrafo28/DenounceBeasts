using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.Application.DTOs
{
    public class CreateMunicipalityDto
    {
        [Required]
        [StringLength(50)]
        public string Code { get; set; }
        
        [Required]
        [StringLength(150)]
        public string Name { get; set; }
    }
}