namespace DenounceBeasts.Domain.Entities
{
    public class ComplaintHistory
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public int ComplaintId { get; set; }
        public int? UserId { get; set; }
        public int StatusId { get; set; }
        public string Comments { get; set; }

        // Relaciones
        public virtual Complaint Complaint { get; set; }
        public virtual User User { get; set; }
        public virtual Status Status { get; set; }
    }
}
