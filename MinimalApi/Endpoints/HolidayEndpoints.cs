using FluentValidation;

namespace MinimalApi.Endpoints
{
    public class HolidayEndpoints : IEndpointDefinition
    {
        public void DefineEndpoints(WebApplication app)
        {
            app.MapGet("/api/holiday", GetAllFutureHolidays)
                .RequireAuthorization()
                .WithName("GetAllFutureHolidays");

            app.MapGet("/api/holiday/availableholidayforuser/{userId}", GetAvailableHolidayNumber)
                .RequireAuthorization()
                .WithName("GetAvailableHolidayNumber");

            app.MapPut("/api/holiday", CreateHoliday)
                .RequireAuthorization(RoleConstants.COMMONPOLICY)
                .WithName("CreateHoliday");

            app.MapDelete("/api/holiday", DeleteHoliday)
                .RequireAuthorization(RoleConstants.COMMONPOLICY)
                .WithName("DeleteHoliday");

            app.MapPost("/api/holiday", UpdateHolidayStatus)
                .RequireAuthorization(RoleConstants.ACCEPTERPOLICY)
                .WithName("UpdateHolidayStatus");
        }

        internal async Task<IResult> GetAllFutureHolidays(ClaimsPrincipal user,
                                                          IMapper mapper,
                                                          IHolidayService holidayService)
        {
            var result = await holidayService.GetFutureHolidays();

            return result.MatchFirst(result => Results.Ok(mapper.Map<List<IncomingHolidayDto>>(result)),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> GetAvailableHolidayNumber(int userId,
                                                               ClaimsPrincipal user,
                                                               IMapper mapper,
                                                               IHolidayService holidayService)
        {
            var result = await holidayService.GetAvailableHolidayNumber(userId);

            return result.MatchFirst(result => Results.Ok(result),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> CreateHoliday(HolidayRequestDto requestDto,
                                                   ClaimsPrincipal user,
                                                   IMapper mapper,
                                                   IHolidayService holidayService)
        {
            var result = await holidayService.CreateHoliday(mapper.Map<Holiday>(requestDto), ClaimHelper.GetUserIdFromToken(user));

            return result.MatchFirst(result => Results.Ok(),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> DeleteHoliday(string id,
                                                   ClaimsPrincipal user,
                                                   IMapper mapper,
                                                   IDataProtectionMapProvider dataProtectionMapProvider,
                                                   IHolidayService holidayService)
        {
            var userId = ClaimHelper.GetUserIdFromToken(user);

            var result = await holidayService.DeleteHoliday(int.Parse(dataProtectionMapProvider.Unprotect(id)), userId);

            return result.MatchFirst(result => Results.Ok(),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> UpdateHolidayStatus(int holidayId, StatusEnum status,
                                                         ClaimsPrincipal user,
                                                         IMapper mapper,
                                                         IDataProtectionMapProvider dataProtectionMapProvider,
                                                         IHolidayService holidayService)
        {
            var userId = ClaimHelper.GetUserIdFromToken(user);

            var result = await holidayService.UpdateStatusHoliday(int.Parse(dataProtectionMapProvider.Unprotect(holidayId)), status, userId);

            return result.MatchFirst(result => Results.Ok(),
                                     error => BusinessErrorHandler.BusinessError(error));
        }
    }
}
