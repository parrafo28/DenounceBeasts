using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DenounceBeasts.API.Entities
{
   // [Table("Municipalities")]
    public class Municipality  
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        // [Column("MunicipalityName")]
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(10)]
        public string Code { get; set; }

        // Relaciones Uno a Muchos
        public virtual ICollection<District> Districts { get; set; } = new List<District>();
    }
}
