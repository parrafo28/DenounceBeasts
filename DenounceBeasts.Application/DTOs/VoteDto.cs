namespace DenounceBeasts.Application.DTOs
{
    public class VoteDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public int UserId { get; set; }
        public int ComplaintId { get; set; }
        public bool IsUpvote { get; set; }
        public string UserFullName { get; set; }
        public string UserNickName { get; set; }
        public string ComplaintTitle { get; set; }
    }
}