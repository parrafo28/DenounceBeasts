using DenounceBeasts.API.Controllers;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DenounceBeasts.API.Entities
{
   // [Table("DISTRICT")]
    public class Municipality
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        // [Column("MunicipalityName")]
        [StringLength(150)]
        public string Name { get; set; }
        [StringLength(50)]
        public string Code { get; set; }

        // Relaciones Uno a Muchos
        public virtual ICollection<District> Districts { get; set; } = new List<District>();
 
    }
}