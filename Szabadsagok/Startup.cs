using AutoMapper;
using Core.Configuration;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Repository;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;
using Szabadsagok.App_Conf;

namespace Szabadsagok
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            services.Configure<DbConfiguration>(Configuration.GetSection("DbConfiguration"));
            services.Configure<AppConfiguration>(Configuration.GetSection("AppConfiguration"));

            var appConfiguration = Configuration.GetSection("AppConfiguration").Get<AppConfiguration>();

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            services.AddDbContext<SzabadsagAppContext>(x => x.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"))); ;

            services.AddDataProtection()
                    .UseCustomCryptographicAlgorithms(new CngCbcAuthenticatedEncryptorConfiguration
                    {
                        EncryptionAlgorithm = "AES",
                        EncryptionAlgorithmProvider = null,
                        EncryptionAlgorithmKeySize = 128
                    });

            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped(typeof(IUserService), typeof(UserService));
            services.AddScoped(typeof(IHolidayService), typeof(HolidayService));
            services.AddScoped(typeof(IYearConfigService), typeof(YearConfigService));
            services.AddScoped(typeof(IEmailService), typeof(EmailService));
            services.AddScoped(typeof(IEventService), typeof(EventService));
            services.AddSingleton(typeof(IDataProtectionMapProvider), typeof(DataProtectionMapProvider));
            services.AddSingleton(provider => new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new MappingConfig(provider.GetService<IDataProtectionMapProvider>()));
            }).CreateMapper());
            //services.AddAutoMapperBuilder
            //services.AddAutoMapperBuilder(builder =>
            //{
            //    builder.Profiles.Add(new UserProfile(services.BuildServiceProvider().GetRequiredService<IUserManager>()));
            //});

            //services.AddAutoMapper(typeof(Startup));

            services.AddCors();

            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appConfiguration.SecretKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

            //services.AddAuthentication().AddMicrosoftAccount(microsoftOptions =>
            //{
            //    microsoftOptions.ClientId = appConfiguration.ClientId;
            //    microsoftOptions.ClientSecret = appConfiguration.ClientId;
            //});

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetRequiredService<SzabadsagAppContext>();
                //context.Database.Migrate();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            app.UseRouting();

            app.UseCors(x => x.AllowAnyOrigin()
                              .AllowAnyMethod()
                              .AllowAnyHeader());

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
