using Core.Configuration;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using ErrorOr;
using Infrastructure.Data;
using Infrastructure.Repository;
using Infrastructure.Services;
using MapsterMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
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

builder.Services.AddAuthorization(cfg => {
    cfg.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

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

app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/api/user/authenticate", async ([FromBody]LoginResultDto login, [FromServices] IUserService userService)  =>
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
.AllowAnonymous()
.WithName("Authenticate");


app.MapGet("/api/user/getallusers", async ([FromServices] IUserService userService,
                                           [FromServices] IMapper mapper)  =>
{
    var result = await userService.GetUsers();

    return result.MatchFirst(result => Results.Ok(mapper.Map<List<UserListDto>>(result)),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("GetAllUsers");



app.MapPost("/api/user/setholiday/{userId}/{year}/{count}", async (int userId, int year, int count,
                                                         ClaimsPrincipal user,
                                                         [FromServices] IUserService userService)  =>
{
    await userService.SetHolidayConfig(year, count, userId, GetUserIdFromToken(user));

    return Results.Ok();
})
.RequireAuthorization()
.WithName("SetHoliday");




app.MapPost("/api/user/updateuser", async ([FromBody]UserDataDto userData,
                                 ClaimsPrincipal user,
                                 [FromServices] IUserService userService,
                                 [FromServices] IMapper mapper)  =>
{
    var result = await userService.UpdateUser(mapper.Map<User>(userData), GetUserIdFromToken(user));

    return result.MatchFirst(result => Results.Ok(),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("UpdateUser");



app.MapPut("/api/user/createuser", async ([FromBody]UserDataDto userData,
                                 ClaimsPrincipal user,
                                 [FromServices] IUserService userService,
                                 [FromServices] IMapper mapper)  =>
{
    var result = await userService.CreateUser(userData.Name, userData.Email, userData.Roles, GetUserIdFromToken(user));

    return result.MatchFirst(result => Results.Ok(mapper.Map<UserDataDto>(result)),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("CreateUser");




app.MapDelete("/api/user/{id}", async (string id,
                                 ClaimsPrincipal user,
                                 [FromServices] IUserService userService,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider)  =>
{
    await userService.DeactivateUser(int.Parse(dataProtectionMapProvider.Unprotect(id)), GetUserIdFromToken(user));

    return Results.Ok();
})
.RequireAuthorization()
.WithName("DeleteUser");




app.MapGet("/api/year/{year}", async (int year,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IYearConfigService yearConfigService)  =>
{
    var yearConfigResult = await yearConfigService.GetYearConfigs(year);

    if (!yearConfigResult.IsError && yearConfigResult.Value.Any())
    {
    var result = await yearConfigService.FillEmptyYearConfigs(year, GetUserIdFromToken(user));

        return yearConfigResult.MatchFirst(result => Results.Ok(mapper.Map<List<YearConfigDto>>(result)),
                                           error => BusinessError(error));
    }
    return Results.NotFound();
})
.RequireAuthorization()
.WithName("GetYear");



app.MapPost("/api/year", async ([FromBody] YearConfigDto yearConfig,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IYearConfigService yearConfigService)  =>
{
    var dayConfig = mapper.Map<YearConfig>(yearConfig);
    await yearConfigService.SetYearData(dayConfig, GetUserIdFromToken(user));

    return Results.Ok(dayConfig);
})
.RequireAuthorization()
.WithName("SetYearData");




app.MapGet("/api/holiday", async (ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IHolidayService holidayService)  =>
{
    var result = await holidayService.GetFutureHolidays();

    return result.MatchFirst(result => Results.Ok(mapper.Map<List<IncomingHolidayDto>>(result)),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("GetAllFutureHolidays");




app.MapGet("/api/holiday/availableholidayforuser/{userId}", async (int userId,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IHolidayService holidayService)  =>
{
    var result = await holidayService.GetAvailableHolidayNumber(userId);

    return result.MatchFirst(result => Results.Ok(result),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("GetAvailableHolidayNumber");




app.MapPut("/api/holiday", async ([FromBody] HolidayRequestDto requestDto,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IHolidayService holidayService)  =>
{
    var result = await holidayService.CreateHoliday(mapper.Map<Holiday>(requestDto), GetUserIdFromToken(user));

    return result.MatchFirst(result => Results.Ok(),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("CreateHoliday");

app.MapDelete("/api/holiday", async (string id,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider,
                                 [FromServices] IHolidayService holidayService)  =>
{
    var userId = GetUserIdFromToken(user);

    var result = await holidayService.DeleteHoliday(int.Parse(dataProtectionMapProvider.Unprotect(id)), userId);

    return result.MatchFirst(result => Results.Ok(),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("DeleteHoliday");


app.MapPost("/api/holiday", async (int holidayId, StatusEnum status,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider,
                                 [FromServices] IHolidayService holidayService)  =>
{
    var userId = GetUserIdFromToken(user);

    var result = await holidayService.UpdateStatusHoliday(int.Parse(dataProtectionMapProvider.Unprotect(holidayId)), status, userId);

    return result.MatchFirst(result => Results.Ok(),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("UpdateHolidayStatus");



app.MapGet("/api/event", async (ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider,
                                 [FromServices] IEventService eventService)  =>
{
    var result = await eventService.GetEvents(false);

    return result.MatchFirst(result => Results.Ok(mapper.Map<List<EventDto>>(result)),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("GetEvent");



app.MapGet("/api/event/{start}/{end}", async (DateTime start, DateTime end,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider,
                                 [FromServices] IEventService eventService)  =>
{
    var result = await eventService.GetEvents(start, end);

    return result.MatchFirst(result => Results.Ok(mapper.Map<List<EventDto>>(result)),
                             error => BusinessError(error));
})
.RequireAuthorization()
.WithName("GetEventBetween");



app.MapDelete("/api/event/{id}", async (string id,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider,
                                 [FromServices] IEventService eventService)  =>
{
    await eventService.DeleteEvent(int.Parse(dataProtectionMapProvider.Unprotect(id)), GetUserIdFromToken(user));

    return Results.NoContent();
})
.RequireAuthorization()
.WithName("DeleteEvent");



app.MapPost("/api/event", async ([FromBody] EventDto newEvent,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider,
                                 [FromServices] IEventService eventService)  =>
{
    await eventService.AddNewEvent(mapper.Map<Event>(newEvent), GetUserIdFromToken(user));

    return Results.StatusCode(StatusCodes.Status201Created);
})
.RequireAuthorization()
.WithName("CreateEvent");


IResult BusinessError(Error error)
{
    var statusCode = error.Type switch
    {
        ErrorType.NotFound => Results.NotFound(error.Description),
        ErrorType.Validation => Results.BadRequest(error.Description),
        ErrorType.Conflict => Results.BadRequest(error.Description),
        ErrorType.Failure => Results.BadRequest(error.Description),
        _ => Results.BadRequest(error.Description)
    };

    return statusCode;
}


int GetUserIdFromToken(ClaimsPrincipal user)
{
    var idStr = ClaimHelper.GetClaimData(user, ClaimTypes.NameIdentifier);

    if (string.IsNullOrWhiteSpace(idStr) || !int.TryParse(idStr, out var userId))
    {
        throw new System.Exception("Unauthorized user!");
    }

    return userId;
}

app.Run();
