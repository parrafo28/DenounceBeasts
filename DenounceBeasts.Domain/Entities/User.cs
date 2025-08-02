namespace DenounceBeasts.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string NickName { get; set; }
        public string PasswordHash { get; set; }
        public string Picture { get; set; }
        public string DeviceId { get; set; }
        public bool IsAnonymous { get; set; }

        // one to one relations
        public UserProfile Profile { get; set; }

        //One to many relations
        public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

        //many to many relations
        public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        public string FullName => $"{FirstName} {LastName}";

        public string? Address { get; set; }
        public string? Phone { get; set; }
    }
}
