using MapsterMapper;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Szabadsagok.App_Conf;
using Szabadsagok.Dto;

namespace Szabadsagok.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HolidayController : BaseController
    {
        private readonly IHolidayService _holidayService;
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        private readonly IDataProtectionMapProvider _dataProtectionMapProvider;

        public HolidayController(IHolidayService holidayService,
                                 IUserService userService,
                                 IDataProtectionMapProvider dataProtectionMapProvider,
                                 IMapper mapper)
        {
            _holidayService = holidayService;
            _userService = userService;
            _dataProtectionMapProvider = dataProtectionMapProvider;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<IncomingHolidayDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllFutureHolidays()
        {
            var result = await _holidayService.GetFutureHolidays();

            return result.MatchFirst(result => Ok(_mapper.Map<List<IncomingHolidayDto>>(result)),
                                     error => BusinessError(error));
        }

        [HttpGet("availableholidayforuser/{userId}")]
        public async Task<IActionResult> GetAvailableHolidaysForUser(int userId)
        {
            var result = await _holidayService.GetAvailableHolidayNumber(userId);

            return result.MatchFirst(result => Ok(result),
                                     error => BusinessError(error));
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateHoliday(HolidayRequestDto requestDto)
        {
            var result = await _holidayService.CreateHoliday(_mapper.Map<Holiday>(requestDto), GetUserIdFromToken());

            return result.MatchFirst(result => Ok(),
                                     error => BusinessError(error));
        }

        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteHoliday(string id)
        {
            var userId = GetUserIdFromToken();

            var result = await _holidayService.DeleteHoliday(int.Parse(_dataProtectionMapProvider.Unprotect(id)), userId);

            return result.MatchFirst(result => Ok(),
                                     error => BusinessError(error));
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateHolidayStatus(int holidayId, StatusEnum status)
        {
            var userId = GetUserIdFromToken();

            var result = await _holidayService.UpdateStatusHoliday(int.Parse(_dataProtectionMapProvider.Unprotect(holidayId)), status, userId);

            return result.MatchFirst(result => Ok(),
                                     error => BusinessError(error));
        }
    }
}
