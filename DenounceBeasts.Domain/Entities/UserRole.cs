namespace DenounceBeasts.Domain.Entities
{
    public class UserRole
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public int UserId { get; set; }
        public int RoleId { get; set; }

        // Relaciones Muchos a Muchos (tablas de unión)
        public virtual User User { get; set; }
        public virtual Role Role { get; set; }
    }
}
