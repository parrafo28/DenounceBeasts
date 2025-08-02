namespace DenounceBeasts.Application.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string NickName { get; set; }
        public string Picture { get; set; }
        public string DeviceId { get; set; }
        public bool IsAnonymous { get; set; }
        public string FullName { get; set; }
        public UserProfileDto Profile { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public int ComplaintsCount { get; set; }
        public int VotesCount { get; set; }
        public int CommentsCount { get; set; }
    }
}