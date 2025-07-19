using AutoMapper;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Municipality, MunicipalityDto>()
                .ForMember(dest => dest.SectorsCount, opt => opt.MapFrom(src => src.Sectors.Count));
            CreateMap<CreateMunicipalityDto, Municipality>();
            CreateMap<UpdateMunicipalityDto, Municipality>();
            
            CreateMap<Sector, SectorDto>()
                .ForMember(dest => dest.MunicipalityName, opt => opt.MapFrom(src => src.Municipality.Name))
                .ForMember(dest => dest.MunicipalityCode, opt => opt.MapFrom(src => src.Municipality.Code))
                .ForMember(dest => dest.ComplaintsCount, opt => opt.MapFrom(src => src.Complaints.Count));
            CreateMap<CreateSectorDto, Sector>();
            CreateMap<UpdateSectorDto, Sector>();
            
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.Role.Name)))
                .ForMember(dest => dest.ComplaintsCount, opt => opt.MapFrom(src => src.Complaints.Count))
                .ForMember(dest => dest.VotesCount, opt => opt.MapFrom(src => src.Votes.Count))
                .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments.Count));
            CreateMap<CreateUserDto, User>();
            
            CreateMap<UserProfile, UserProfileDto>();
            
            CreateMap<Complaint, ComplaintDto>()
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ComplaintTypeName, opt => opt.MapFrom(src => src.ComplaintType.Name))
                .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.Name))
                .ForMember(dest => dest.SectorName, opt => opt.MapFrom(src => src.Sector.Name))
                .ForMember(dest => dest.MunicipalityName, opt => opt.MapFrom(src => src.Sector.Municipality.Name))
                .ForMember(dest => dest.VotesCount, opt => opt.MapFrom(src => src.Votes.Count))
                .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments.Count));
            CreateMap<CreateComplaintDto, Complaint>();
            CreateMap<UpdateComplaintDto, Complaint>();
            
            CreateMap<ComplaintType, ComplaintTypeDto>()
                .ForMember(dest => dest.ComplaintsCount, opt => opt.MapFrom(src => src.Complaints.Count));
            
            CreateMap<Status, StatusDto>()
                .ForMember(dest => dest.ComplaintsCount, opt => opt.MapFrom(src => src.Complaints.Count));
            
            CreateMap<Comment, CommentDto>()
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.UserNickName, opt => opt.MapFrom(src => src.User.NickName))
                .ForMember(dest => dest.UserPicture, opt => opt.MapFrom(src => src.User.Picture))
                .ForMember(dest => dest.ComplaintTitle, opt => opt.MapFrom(src => src.Complaint.Title));
            CreateMap<CreateCommentDto, Comment>();
            
            CreateMap<Vote, VoteDto>()
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.UserNickName, opt => opt.MapFrom(src => src.User.NickName))
                .ForMember(dest => dest.ComplaintTitle, opt => opt.MapFrom(src => src.Complaint.Title));
            CreateMap<CreateVoteDto, Vote>();
            
            CreateMap<Attachment, AttachmentDto>()
                .ForMember(dest => dest.ComplaintTitle, opt => opt.MapFrom(src => src.Complaint.Title));
            
            CreateMap<Role, RoleDto>()
                .ForMember(dest => dest.UsersCount, opt => opt.MapFrom(src => src.UserRoles.Count));
            
            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName));
            
            CreateMap<ComplaintHistory, ComplaintHistoryDto>()
                .ForMember(dest => dest.ComplaintTitle, opt => opt.MapFrom(src => src.Complaint.Title))
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.Name))
                .ForMember(dest => dest.StatusColor, opt => opt.MapFrom(src => src.Status.Color));
        }
    }
}