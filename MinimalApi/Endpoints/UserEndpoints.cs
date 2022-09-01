using FluentValidation;

namespace MinimalApi.Endpoints
{
    public class UserEndpoints : IEndpointDefinition
    {
        public void DefineEndpoints(WebApplication app)
        {
            app.MapPost("/api/user/authenticate", Authenticate)
                .AllowAnonymous()
                .WithName("Authenticate");

            app.MapGet("/api/user/getallusers", GetAllUsers)
                .RequireAuthorization()
                .WithName("GetAllUsers");

            app.MapPost("/api/user/setholiday/{userId}/{year}/{count}", SetHoliday)
                .RequireAuthorization()
                .WithName("SetHoliday");

            app.MapPost("/api/user/updateuser", UpdateUser)
                .RequireAuthorization(RoleConstants.ADMINPOLICY)
                .WithName("UpdateUser");

            app.MapPut("/api/user/createuser", CreateUser)
                .RequireAuthorization(RoleConstants.ADMINPOLICY)
                .WithName("CreateUser");

            app.MapDelete("/api/user/{id}", DeleteUser)
                .RequireAuthorization(RoleConstants.ADMINPOLICY)
                .WithName("DeleteUser");
        }

        internal async Task<IResult> Authenticate(LoginResultDto login, IUserService userService)
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
        }

        internal async Task<IResult> GetAllUsers(IUserService userService, IMapper mapper)
        {
            var result = await userService.GetUsers();

            return result.MatchFirst(result => Results.Ok(mapper.Map<List<UserListDto>>(result)),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> SetHoliday(int userId, int year, int count,
                                                ClaimsPrincipal user,
                                                IUserService userService)
        {
            await userService.SetHolidayConfig(year, count, userId, ClaimHelper.GetUserIdFromToken(user));

            return Results.Ok();
        }

        internal async Task<IResult> UpdateUser(UserDataDto userData,
                                                ClaimsPrincipal user,
                                                IValidator<User> validator,
                                                IUserService userService,
                                                IMapper mapper)
        {
            var validation = await validator.ValidateAsync(mapper.Map<User>(userData));
            if (!validation.IsValid)
            {
                return Results.BadRequest(validation.Errors);
            }

            var result = await userService.UpdateUser(mapper.Map<User>(userData), ClaimHelper.GetUserIdFromToken(user));

            return result.MatchFirst(result => Results.Ok(),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> CreateUser(UserDataDto userData,
                                                IValidator<User> validator,
                                                ClaimsPrincipal user,
                                                IUserService userService,
                                                IMapper mapper)
        {
            var validation = await validator.ValidateAsync(mapper.Map<User>(userData));
            if (!validation.IsValid)
            {
                return Results.BadRequest(validation.Errors);
            }

            var result = await userService.CreateUser(userData.Name, userData.Email, userData.Roles, ClaimHelper.GetUserIdFromToken(user));

            return result.MatchFirst(result => Results.Ok(mapper.Map<UserDataDto>(result)),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> DeleteUser(string id,
                                                ClaimsPrincipal user,
                                                IUserService userService,
                                                IDataProtectionMapProvider dataProtectionMapProvider)
        {
            await userService.DeactivateUser(int.Parse(dataProtectionMapProvider.Unprotect(id)), ClaimHelper.GetUserIdFromToken(user));

            return Results.Ok();
        }
    }
}
