namespace DenounceBeasts.API.Entities
{
    public class District  
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Code { get; set; }
        public int MunicipalityId { get; set; }

        // Relaciones Uno a Muchos (extremo muchos)
        public virtual Municipality Municipality { get; set; }

        // Relaciones Uno a Muchos (extremo uno)
        //public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();
    }
}
