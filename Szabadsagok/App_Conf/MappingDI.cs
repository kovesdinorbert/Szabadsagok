using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Szabadsagok.App_Conf
{
    public static class MappingDI
    {
        public static IServiceCollection AddMappings(this IServiceCollection services)
        {
            var config = TypeAdapterConfig.GlobalSettings;
            config.Scan(Assembly.GetExecutingAssembly());

            services.AddSingleton(config);
            services.AddScoped<IDataProtectionMapProvider, DataProtectionMapProvider>();
            services.AddScoped<IMapper, ServiceMapper>();

            return services;
        }
    }
}
