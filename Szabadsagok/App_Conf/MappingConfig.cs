using AutoMapper;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using Szabadsagok.Dto;

namespace Szabadsagok.App_Conf
{
    public class MappingConfig : Profile
    {
        public MappingConfig(IDataProtectionMapProvider dataProtectionMapProvider)
        {
            CreateMap<IHasIdDto, IHasId>()
                .ForMember(dst => dst.Id, opt => opt.MapFrom(src => dataProtectionMapProvider.Unprotect(src.Id.ToString())));
            CreateMap<IHasId, IHasIdDto>()
                .ForMember(dst => dst.Id, opt => opt.MapFrom(src => dataProtectionMapProvider.Protect(src.Id.ToString())));


            CreateMap<HolidayRequestDto, Holiday>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => StatusEnum.Requested))
                .ForMember(dst => dst.Year, opt => opt.MapFrom(src => src.Start.Year));

            CreateMap<Holiday, IncomingHolidayDto>()
                .ForMember(dst => dst.UserName, opt => opt.MapFrom(src => src.User.Name));

            CreateMap<User, UserDataDto>()
                .IncludeBase<IHasId, IHasIdDto>();

            CreateMap<User, UserListDto>()
                .IncludeBase<IHasId, IHasIdDto>();

            CreateMap<UserDataDto, User>()
                .IncludeBase<IHasIdDto, IHasId>();
        }
    }
}
