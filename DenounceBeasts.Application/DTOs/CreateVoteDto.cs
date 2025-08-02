using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.Application.DTOs
{
    public class CreateVoteDto
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ComplaintId { get; set; }
        
        [Required]
        public bool IsUpvote { get; set; }
    }
}