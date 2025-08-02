using AutoMapper;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Application.MapingProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            #region Sector
            CreateMap<Sector, SectorDto>()
                .ForMember(dest => dest.MunicipalityName,
                opt => opt.MapFrom(src => src.Municipality.Name))
                .ReverseMap();

            CreateMap<Sector, CreateSectorDto>()
                .ReverseMap();

            CreateMap<Sector, UpdateSectorDto>()
                .ReverseMap();

            #endregion

            //CreateMap<SectorDto, Sector>();
            CreateMap<Municipality, MunicipalityDto>()
               .ForMember(dest => dest.Sectors, opt => opt.Ignore()).ReverseMap();
        }
    }
}
