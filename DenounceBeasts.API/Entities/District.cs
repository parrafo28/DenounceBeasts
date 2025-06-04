using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.API.Entities
{
    public class District
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(10)]
        public string Code { get; set; }
        public int MunicipalityId { get; set; }

        // Relaciones Uno a Muchos (extremo muchos)
        public virtual Municipality Municipality { get; set; }

        // Relaciones Uno a Muchos (extremo uno)
        //public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();


    }
}
