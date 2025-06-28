namespace DenounceBeasts.Domain.Entities
{
    public class Vote
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
 
        public int UserId { get; set; }
        public int ComplaintId { get; set; }
        public bool IsUpvote { get; set; }

        // Relaciones Muchos a Muchos (tablas de unión)
       // public virtual User User { get; set; }
        public virtual Complaint Complaint { get; set; }
    }
}
