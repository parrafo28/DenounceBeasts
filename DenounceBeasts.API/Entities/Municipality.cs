namespace DenounceBeasts.API.Entities
{
    public class Municipality  
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Code { get; set; }

        // Relaciones Uno a Muchos
        public virtual ICollection<District> Districts { get; set; } = new List<District>();
    }
}
