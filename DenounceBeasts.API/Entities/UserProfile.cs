namespace DenounceBeasts.API.Entities
{
    public class UserProfile
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public int UserId { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string Identification { get; set; }
        public DateTime? BirthDate { get; set; }
        public string Bio { get; set; }

        // Relación Uno a Uno
        public virtual User User { get; set; }
    }
}
