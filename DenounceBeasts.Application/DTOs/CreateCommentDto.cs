using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.Application.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        [StringLength(1000)]
        public string Content { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ComplaintId { get; set; }
        
        public int? ParentCommentId { get; set; }
    }
}