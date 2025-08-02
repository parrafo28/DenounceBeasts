namespace DenounceBeasts.Domain.Entities
{
    public class ComplaintType
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }

        //One to many relations
        public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    }
}
