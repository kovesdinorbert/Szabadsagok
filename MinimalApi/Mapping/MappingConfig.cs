namespace SzabadsagolosMinimalApi
{
    public class MappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<IHasIdDto, IHasId>()
                .Map(dst => dst.Id, opt => string.IsNullOrWhiteSpace(opt.Id) ? 0 : Convert.ToInt32(MapContext.Current.GetService<IDataProtectionMapProvider>().Unprotect(opt.Id.ToString())));
            config.NewConfig<IHasId, IHasIdDto>()
                .Map(dst => dst.Id, opt => opt.Id == 0 ? "" : MapContext.Current.GetService<IDataProtectionMapProvider>().Protect(opt.Id.ToString()));

            config.NewConfig<HolidayRequestDto, Holiday>()
                .Map(dst => dst.Status, opt => StatusEnum.Requested)
                .Map(dst => dst.Year, opt => opt.Start.Year);

            config.NewConfig<Holiday, IncomingHolidayDto>()
                .Map(dst => dst.UserName, opt => opt.User.Name);

            config.NewConfig<User, UserDataDto>()
                .Inherits<IHasId, IHasIdDto>();

            config.NewConfig<User, UserListDto>()
                .Inherits<IHasId, IHasIdDto>()
                .Map(dst => dst.HolidayForYears, opt => opt.HolidayConfigs);

            config.NewConfig<UserDataDto, User>()
                .Inherits<IHasIdDto, IHasId>();

            config.NewConfig<YearConfigDto, YearConfig>()
                .Inherits<IHasIdDto, IHasId>();

            config.NewConfig<YearConfig, YearConfigDto>()
                .Inherits<IHasId, IHasIdDto>();

            config.NewConfig<HolidayConfig, HolidayForYearDto>()
                .Inherits<IHasId, IHasIdDto>();

            config.NewConfig<HolidayForYearDto, HolidayConfig>()
                .Inherits<IHasIdDto, IHasId>();

            config.NewConfig<Event, EventDto>()
                .Inherits<IHasId, IHasIdDto>();

            config.NewConfig<EventDto, Event>()
                .Inherits<IHasIdDto, IHasId>();
        }
    }
}
