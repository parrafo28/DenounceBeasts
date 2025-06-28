namespace DenounceBeasts.Domain.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string NormalizedName { get; set; }
        public string Description { get; set; }

        // Relaciones Muchos a Muchos
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    }
}
