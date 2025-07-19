namespace DenounceBeasts.Application.DTOs
{
    public class AttachmentDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public int ComplaintId { get; set; }
        public string ComplaintTitle { get; set; }
    }
}