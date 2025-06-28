namespace DenounceBeasts.Domain.Entities
{
    public class Status
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }

        // Relaciones Uno a Muchos
        public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    }
}
