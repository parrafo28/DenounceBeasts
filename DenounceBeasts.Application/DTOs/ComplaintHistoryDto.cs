namespace DenounceBeasts.Application.DTOs
{
    public class ComplaintHistoryDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public int ComplaintId { get; set; }
        public int? UserId { get; set; }
        public int StatusId { get; set; }
        public string Comments { get; set; }
        public string ComplaintTitle { get; set; }
        public string UserFullName { get; set; }
        public string StatusName { get; set; }
        public string StatusColor { get; set; }
    }
}