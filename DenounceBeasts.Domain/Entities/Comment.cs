namespace DenounceBeasts.Domain.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string Content { get; set; }
        public int UserId { get; set; }
        public int ComplaintId { get; set; }
        public int? ParentCommentId { get; set; }

        //Many to many relation (join union)
        public virtual User User { get; set; }
        public virtual Complaint Complaint { get; set; }

        // self-referencing relation  
        public virtual Comment ParentComment { get; set; }
        public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();
    }
}
