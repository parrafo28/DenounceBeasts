namespace DenounceBeasts.Application.DTOs
{
    public class ComplaintDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Detail { get; set; }
        public string Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string Image { get; set; }
        public int UserId { get; set; }
        public int ComplaintTypeId { get; set; }
        public int StatusId { get; set; }
        public int? SectorId { get; set; }
        public string UserFullName { get; set; }
        public string ComplaintTypeName { get; set; }
        public string StatusName { get; set; }
        public string SectorName { get; set; }
        public string MunicipalityName { get; set; }
        public int VotesCount { get; set; }
        public int CommentsCount { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new List<AttachmentDto>();
    }
}