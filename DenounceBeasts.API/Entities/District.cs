using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DenounceBeasts.API.Entities
{
    public class District
    {
     // [NotMapped] 
        //public int CoverPercent { get; set; }
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        [StringLength(150)]
        public string Name { get; set; }
        [StringLength(50)]
        public string Code { get; set; }
        public int MunicipalityId { get; set; }

        // Relaciones Uno a Muchos (extremo muchos)
        public virtual Municipality Municipality { get; set; }

        // Relaciones Uno a Muchos (extremo uno)
        //public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();
 
    }
}