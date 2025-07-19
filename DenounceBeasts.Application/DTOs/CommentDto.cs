namespace DenounceBeasts.Application.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public string Content { get; set; }
        public int UserId { get; set; }
        public int ComplaintId { get; set; }
        public int? ParentCommentId { get; set; }
        public string UserFullName { get; set; }
        public string UserNickName { get; set; }
        public string UserPicture { get; set; }
        public string ComplaintTitle { get; set; }
        public List<CommentDto> Replies { get; set; } = new List<CommentDto>();
    }
}