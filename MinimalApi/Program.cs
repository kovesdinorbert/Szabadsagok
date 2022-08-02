using Core.Configuration;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Repository;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SzabadsagolosMinimalApi;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<DbConfiguration>(builder.Configuration.GetSection("DbConfiguration"));
builder.Services.Configure<AppConfiguration>(builder.Configuration.GetSection("AppConfiguration"));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var appConfiguration = builder.Configuration.GetSection("AppConfiguration").Get<AppConfiguration>();
builder.Services.AddDbContext<SzabadsagAppContext>(x => x.UseSqlServer(connectionString));

builder.Services.AddDataProtection()
.UseCustomCryptographicAlgorithms(new CngCbcAuthenticatedEncryptorConfiguration
{
    EncryptionAlgorithm = "AES",
    EncryptionAlgorithmProvider = null,
    EncryptionAlgorithmKeySize = 128
});

builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped(typeof(IUserService), typeof(UserService));
builder.Services.AddScoped(typeof(IHolidayService), typeof(HolidayService));
builder.Services.AddScoped(typeof(IYearConfigService), typeof(YearConfigService));
builder.Services.AddScoped(typeof(IEmailService), typeof(EmailService));
builder.Services.AddScoped(typeof(IEventService), typeof(EventService));
builder.Services.AddSingleton(typeof(IDataProtectionMapProvider), typeof(DataProtectionMapProvider));
builder.Services.AddMappings();
builder.Services.AddCors();

builder.Services.AddAuthentication(opt => {
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
}
app.UseCors(x => x.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader());


app.MapPost("/api/user/authenticate",async ([FromBody]LoginResultDto login, [FromServices] IUserService userService)  =>
{
    var userResult = await userService.GetUserByEmail(login.Email);

    var token = "";

    if (!userResult.IsError)
    {
        token = await userService.GenerateToken(userResult.Value);
    }

    return userResult.MatchFirst<IResult>(user => Results.Ok(new LoginResultDto()
    {
        Email = user.Email,
        Id = user.Id.ToString(),
        Token = token
    }),
                                                error => Results.Unauthorized());
})
.WithName("GetWeatherForecast");

app.Run();

internal record WeatherForecast(DateTime Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}