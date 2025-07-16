
using AutoMapper;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Municipality mappings
            CreateMap<Municipality, MunicipaltyDto>()
                .ForMember(dest => dest.Districts, opt => opt.Ignore()).ReverseMap();
            //CreateMap<MunicipaltyDto, Municipality>().ReverseMap();
            CreateMap<Municipality, CreateMunicipaltyDto>().ReverseMap();

            // District mappings
            CreateMap<District, CreateDistrictDto>().ReverseMap(); 
            CreateMap<District, UpdateDistrictDto>().ReverseMap();
            CreateMap<District, DistrictDto>()
                .ForMember(dest => dest.MunicipalityName, opt => opt.MapFrom(src => src.Municipality.Name)).ReverseMap();
            // CreateMap<DistrictDto, District>().ReverseMap();
        }
    }
}
