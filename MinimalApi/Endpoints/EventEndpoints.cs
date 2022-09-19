using FluentValidation;

namespace MinimalApi.Endpoints
{
    public class EventEndpoints : IEndpointDefinition
    {
        public void DefineEndpoints(WebApplication app)
        {

            app.MapGet("/api/event", GetEvent)
                .RequireAuthorization()
                .WithName("GetEvent");

            app.MapGet("/api/event/{start}/{end}", GetEventBetween)
                .RequireAuthorization()
                .WithName("GetEventBetween");

            app.MapDelete("/api/event/{id}", DeleteEvent)
                .RequireAuthorization(RoleConstants.ADMINPOLICY)
                .WithName("DeleteEvent");

            app.MapPost("/api/event", CreateEvent)
                .RequireAuthorization(RoleConstants.ADMINPOLICY)
                .WithName("CreateEvent");

        }

        internal async Task<IResult> GetEvent(ClaimsPrincipal user,
                                              IMapper mapper,
                                              IDataProtectionMapProvider dataProtectionMapProvider,
                                              IEventService eventService)
        {
            var result = await eventService.GetEvents(false);

            return result.MatchFirst(result => Results.Ok(mapper.Map<List<EventDto>>(result)),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> GetEventBetween(DateTime start, DateTime end,
                                                     IMapper mapper,
                                                     IDataProtectionMapProvider dataProtectionMapProvider,
                                                     IEventService eventService)
        {
            var result = await eventService.GetEvents(start, end);

            return result.MatchFirst(result => Results.Ok(mapper.Map<List<EventDto>>(result)),
                                     error => BusinessErrorHandler.BusinessError(error));
        }

        internal async Task<IResult> DeleteEvent(string id,
                                                 ClaimsPrincipal user,
                                                 IMapper mapper,
                                                 IDataProtectionMapProvider dataProtectionMapProvider,
                                                 IEventService eventService)
        {
            await eventService.DeleteEvent(int.Parse(dataProtectionMapProvider.Unprotect(id)), ClaimHelper.GetUserIdFromToken(user));

            return Results.NoContent();
        }

        internal async Task<IResult> CreateEvent(EventDto newEvent,
                                                 IValidator<EventDto> validator,
                                                 ClaimsPrincipal user,
                                                 IMapper mapper,
                                                 IDataProtectionMapProvider dataProtectionMapProvider,
                                                 IEventService eventService)
        {
            var validation = await validator.ValidateAsync(newEvent);
            if (!validation.IsValid)
            {
                return Results.BadRequest(validation.Errors);
            }

            var e = mapper.Map<EventDto>(await eventService.AddNewEvent(mapper.Map<Event>(newEvent), ClaimHelper.GetUserIdFromToken(user)));

            return Results.Ok(e);
        }
    }
}
