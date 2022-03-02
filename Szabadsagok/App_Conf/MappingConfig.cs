using AutoMapper;
using Core.Entities;
using Core.Enums;
using Szabadsagok.Dto;

namespace Szabadsagok.App_Conf
{
    public class MappingConfig : Profile
    {
        public MappingConfig()
        {
            CreateMap<HolidayRequestDto, Holiday>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => StatusEnum.Requested))
                .ForMember(dst => dst.Year, opt => opt.MapFrom(src => src.Start.Year));
            CreateMap<Holiday, IncomingHolidayDto>()
                .ForMember(dst => dst.UserName, opt => opt.MapFrom(src => src.User.Name));
            CreateMap<User, UserDataDto>();
            CreateMap<User, UserListDto>();
            //CreateMap<EventDto, Event>()
            //    .ForMember(dst => dst.Modified, opt => opt.MapFrom(src => DateTime.Now))
            //    .ForMember(dst => dst.IsActive, opt => opt.Ignore())
            //    .ForMember(dst => dst.CreatedBy, opt => opt.Ignore())
            //    .ForMember(dst => dst.Created, opt => opt.Ignore());
        }
    }
}
