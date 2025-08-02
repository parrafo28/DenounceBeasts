namespace DenounceBeasts.Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public string NotificationType { get; set; }
        public string RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
         
        public virtual User User { get; set; }
    }
}
