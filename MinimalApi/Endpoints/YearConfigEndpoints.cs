using Core.Entities;
using Core.Interfaces;
using FluentValidation;
using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using MinimalApi.Helpers;
using System.Security.Claims;
using SzabadsagolosMinimalApi;

namespace MinimalApi.Endpoints
{
    public class YearConfigEndpoints: IEndpointDefinition
    {
        public void DefineEndpoints(WebApplication app)
        {
            app.MapGet("/api/year/{start}/{end}", GetYearStartEnd)
                .RequireAuthorization()
                .WithName("GetYearStartEnd");

            app.MapGet("/api/year/{year}", GetYear)
                .RequireAuthorization()
                .WithName("GetYear");

            app.MapPost("/api/year", SetYearData)
                .RequireAuthorization(RoleConstants.ADMINPOLICY)
                .WithName("SetYearData");
        }

        internal async Task<IResult> GetYearStartEnd(DateTime start, DateTime end,
                                                     ClaimsPrincipal user,
                                                     IMapper mapper,
                                                     IYearConfigService yearConfigService)
        {
            var yearConfigResult = await yearConfigService.GetYearConfigs(start, end, ClaimHelper.GetUserIdFromToken(user));

            if (!yearConfigResult.IsError)
            {
                return yearConfigResult.MatchFirst(result => Results.Ok(mapper.Map<List<YearConfigDto>>(result)),
                                                   error => BusinessErrorHandler.BusinessError(error));
            }
            return Results.NotFound();
        }

        internal async Task<IResult> GetYear(int year,
                                             ClaimsPrincipal user,
                                             IMapper mapper,
                                             IYearConfigService yearConfigService)
        {
            var yearConfigResult = await yearConfigService.GetYearConfigs(year, ClaimHelper.GetUserIdFromToken(user));

            if (!yearConfigResult.IsError)
            {
                return yearConfigResult.MatchFirst(result => Results.Ok(mapper.Map<List<YearConfigDto>>(result)),
                                                   error => BusinessErrorHandler.BusinessError(error));
            }
            return Results.NotFound();
        }

        internal async Task<IResult> SetYearData(YearConfigDto yearConfig,
                                                 ClaimsPrincipal user,
                                                 IMapper mapper,
                                                 IYearConfigService yearConfigService)
        {
            var dayConfig = mapper.Map<YearConfig>(yearConfig);
            await yearConfigService.SetYearData(dayConfig, ClaimHelper.GetUserIdFromToken(user));

            return Results.Ok(dayConfig);
        }
    }
}
