using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.Application.DTOs
{
    public class UpdateComplaintDto
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        [StringLength(1000)]
        public string Description { get; set; }
        
        [StringLength(2000)]
        public string Detail { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Address { get; set; }
        
        public double? Latitude { get; set; }
        
        public double? Longitude { get; set; }
        
        public string Image { get; set; }
        
        [Required]
        public int ComplaintTypeId { get; set; }
        
        [Required]
        public int StatusId { get; set; }
        
        public int? SectorId { get; set; }
    }
}