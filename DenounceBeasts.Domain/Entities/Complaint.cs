using System.Net.Mail;

namespace DenounceBeasts.Domain.Entities
{
    public class Complaint
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string Title { get; set; }
        public string Description { get; set; }
        public string Detail { get; set; }
        public string Address { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string Image { get; set; }

        // Foreign Keys
        public int UserId { get; set; }
        public int ComplaintTypeId { get; set; }
        public int StatusId { get; set; }
        public int? SectorId { get; set; }

        // one to many Relations (we are in the many side)  
        public virtual User User { get; set; }
        public virtual ComplaintType ComplaintType { get; set; }
        public virtual Status Status { get; set; }
        public virtual Sector Sector { get; set; }

        // one to many relation (we are in the side one)
        public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();

        // many to many relations (join tables)
        public virtual ICollection<Vote> Votes { get; set; }  = new List<Vote>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<ComplaintHistory> History { get; set; } = new List<ComplaintHistory>();

        //public Complaint()
        //{
        //    Attachments = new List<Attachment>();  
        //}

    }
}
