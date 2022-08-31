using Core.Configuration;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using Core.Queries;
using Core.Validation;
using ErrorOr;
using FluentValidation;
using Infrastructure.Data;
using Infrastructure.QueryHandlers;
using Infrastructure.Repository;
using Infrastructure.Services;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using SzabadsagolosMinimalApi;

const string ADMINPOLICY = "Admin";
const string ACCEPTERPOLICY = "Accepter";
const string COMMONPOLICY = "COMMON";

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<DbConfiguration>(builder.Configuration.GetSection("DbConfiguration"));
builder.Services.Configure<AppConfiguration>(builder.Configuration.GetSection("AppConfiguration"));

var appConfiguration = builder.Configuration.GetSection("AppConfiguration").Get<AppConfiguration>();
var dbConfiguration = builder.Configuration.GetSection("DbConfiguration").Get<DbConfiguration>();
builder.Services.AddDbContext<SzabadsagAppContext>(x => x.UseSqlServer(dbConfiguration.DbConnection));

builder.Services.AddSingleton<DapperContext>();
builder.Services.AddDataProtection()
.UseCustomCryptographicAlgorithms(new CngCbcAuthenticatedEncryptorConfiguration
{
    EncryptionAlgorithm = "AES",
    EncryptionAlgorithmProvider = null,
    EncryptionAlgorithmKeySize = 128
});

builder.Services.AddScoped(typeof(IGenericCommandRepository<>), typeof(GenericCommandRepository<>));
builder.Services.AddScoped(typeof(IUserService), typeof(UserService));
builder.Services.AddScoped(typeof(IHolidayService), typeof(HolidayService));
builder.Services.AddScoped(typeof(IYearConfigService), typeof(YearConfigService));
builder.Services.AddScoped(typeof(IEmailService), typeof(EmailService));
builder.Services.AddScoped(typeof(IEventService), typeof(EventService));
builder.Services.AddSingleton(typeof(IDataProtectionMapProvider), typeof(DataProtectionMapProvider));
builder.Services.AddScoped<IValidator<Event>, EventValidation>();
builder.Services.AddScoped<IValidator<User>, UserValidation>();
builder.Services.AddScoped<IValidator<Holiday>, HolidayValidation>();
builder.Services.AddMappings();
builder.Services.AddCors();
builder.Services.AddMediatR(typeof(GetAllUserQueryHandler).GetTypeInfo().Assembly);
builder.Services.AddScoped<IGenericQueryRepository<User>, UserQueryRepository<User>>();

builder.Services.AddAuthorization(cfg => {
    cfg.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    cfg.AddPolicy(ADMINPOLICY, policy => policy.RequireClaim(ClaimTypes.Role, RoleEnum.Admin.ToString()));
    cfg.AddPolicy(ACCEPTERPOLICY, policy => policy.RequireClaim(ClaimTypes.Role, RoleEnum.Accepter.ToString()));
    cfg.AddPolicy(COMMONPOLICY, policy => policy.RequireClaim(ClaimTypes.Role, RoleEnum.Common.ToString()));
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

app.UseMiddleware<ValidationExceptionMiddleware>();



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
                                           [FromServices] IMediator mediator,
                                           [FromServices] IMapper mapper)  =>
{
    var result = await mediator.Send(new GetAllUserQuery());

    return Results.Ok(mapper.Map<List<UserListDto>>(result));
})
//.RequireAuthorization()
.AllowAnonymous()
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
                                 IValidator<User> validator,
                                 [FromServices] IUserService userService,
                                 [FromServices] IMapper mapper)  =>
{
    var validation = await validator.ValidateAsync(mapper.Map<User>(userData));
    if (!validation.IsValid)
    {
        return Results.BadRequest(validation.Errors);
    }

    var result = await userService.UpdateUser(mapper.Map<User>(userData), GetUserIdFromToken(user));

    return result.MatchFirst(result => Results.Ok(),
                             error => BusinessError(error));
})
.RequireAuthorization(ADMINPOLICY)
.WithName("UpdateUser");



app.MapPut("/api/user/createuser", async ([FromBody]UserDataDto userData,
                                 IValidator<User> validator,
                                 ClaimsPrincipal user,
                                 [FromServices] IUserService userService,
                                 [FromServices] IMapper mapper)  =>
{
    var validation = await validator.ValidateAsync(mapper.Map<User>(userData));
    if (!validation.IsValid)
    {
        return Results.BadRequest(validation.Errors);
    }

    var result = await userService.CreateUser(userData.Name, userData.Email, userData.Roles, GetUserIdFromToken(user));

    return result.MatchFirst(result => Results.Ok(mapper.Map<UserDataDto>(result)),
                             error => BusinessError(error));
})
.RequireAuthorization(ADMINPOLICY)
.WithName("CreateUser");




app.MapDelete("/api/user/{id}", async (string id,
                                 ClaimsPrincipal user,
                                 [FromServices] IUserService userService,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider)  =>
{
    await userService.DeactivateUser(int.Parse(dataProtectionMapProvider.Unprotect(id)), GetUserIdFromToken(user));

    return Results.Ok();
})
.RequireAuthorization(ADMINPOLICY)
.WithName("DeleteUser");




app.MapGet("/api/year/{start}/{end}", async (DateTime start, DateTime end,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IYearConfigService yearConfigService)  =>
{
    var yearConfigResult = await yearConfigService.GetYearConfigs(start, end, GetUserIdFromToken(user));

    if (!yearConfigResult.IsError)
    {
        return yearConfigResult.MatchFirst(result => Results.Ok(mapper.Map<List<YearConfigDto>>(result)),
                                           error => BusinessError(error));
    }
    return Results.NotFound();
})
.RequireAuthorization()
.WithName("GetYearStartEnd");



app.MapGet("/api/year/{year}", async (int year,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IYearConfigService yearConfigService)  =>
{
    var yearConfigResult = await yearConfigService.GetYearConfigs(year, GetUserIdFromToken(user));

    if (!yearConfigResult.IsError)
    {
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
.RequireAuthorization(ADMINPOLICY)
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
.RequireAuthorization(COMMONPOLICY)
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
.RequireAuthorization(COMMONPOLICY)
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
.RequireAuthorization(ACCEPTERPOLICY)
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
.RequireAuthorization(ADMINPOLICY)
.WithName("DeleteEvent");



app.MapPost("/api/event", async ([FromBody] EventDto newEvent,
                                 IValidator<Event> validator,
                                 ClaimsPrincipal user,
                                 [FromServices] IMapper mapper,
                                 [FromServices] IDataProtectionMapProvider dataProtectionMapProvider,
                                 [FromServices] IEventService eventService)  =>
{
    var validation = await validator.ValidateAsync(mapper.Map<Event>(newEvent));
    if (!validation.IsValid)
    {
        return Results.BadRequest(validation.Errors);
    }

    var e = mapper.Map<EventDto>(await eventService.AddNewEvent(mapper.Map<Event>(newEvent), GetUserIdFromToken(user)));

    return Results.Ok(e);
})
.RequireAuthorization(ADMINPOLICY)
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
