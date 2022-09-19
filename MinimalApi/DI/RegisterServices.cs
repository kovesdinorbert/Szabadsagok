using FluentValidation;
using Infrastructure.Repository;
using Infrastructure.Services;
using MinimalApi.Helpers.Validation;

namespace MinimalApi.DI
{
    public static class RegisterServices
    {
        public static void RegisterAppServices(this IServiceCollection services)
        {
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped(typeof(IUserService), typeof(UserService));
            services.AddScoped(typeof(IHolidayService), typeof(HolidayService));
            services.AddScoped(typeof(IYearConfigService), typeof(YearConfigService));
            services.AddScoped(typeof(IEmailService), typeof(EmailService));
            services.AddScoped(typeof(IEventService), typeof(EventService));
            services.AddSingleton(typeof(IDataProtectionMapProvider), typeof(DataProtectionMapProvider));
            services.AddScoped<IValidator<EventDto>, EventValidation>();
            services.AddScoped<IValidator<UserDataDto>, UserValidation>();
            services.AddScoped<IValidator<HolidayRequestDto>, HolidayValidation>();
        }
    }
}
