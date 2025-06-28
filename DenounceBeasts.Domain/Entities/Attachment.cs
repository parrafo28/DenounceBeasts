using System.ComponentModel.DataAnnotations.Schema;

namespace DenounceBeasts.Domain.Entities
{
    public class Attachment
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        //[Column("Complaint_Id")]
        public int ComplaintId { get; set; }

        // Relaciones Uno a Muchos (extremo muchos)
        public virtual Complaint Complaint { get; set; }
    }
}
