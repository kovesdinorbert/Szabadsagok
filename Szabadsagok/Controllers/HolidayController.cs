using MapsterMapper;
using Core.Entities;
using Core.Enums;
using Core.Exceptions;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Szabadsagok.App_Conf;
using Szabadsagok.Dto;
using Szabadsagok.Helpers;

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
            GetUserIdFromToken();

            List<IncomingHolidayDto> ret;
            try
            {
                ret = _mapper.Map<List<IncomingHolidayDto>>(await _holidayService.GetFutureHolidays());
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok(ret);
        }

        [HttpGet("availableholidayforuser/{userId}")]
        public async Task<IActionResult> GetAvailableHolidaysForUser(int userId)
        {
            var value = await _holidayService.GetAvailableHolidayNumber(userId);
            return Ok(value);
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateHoliday(HolidayRequestDto requestDto)
        {
            var userId = GetUserIdFromToken();

            try
            {
                await _holidayService.CreateHoliday(_mapper.Map<Holiday>(requestDto), userId);
            }
            catch (BusinessLogicException e)
            {
                return StatusCode(StatusCodes.Status403Forbidden, e.Message);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }

        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteHoliday(string id)
        {
            var userId = GetUserIdFromToken();

            try
            {
                await _holidayService.DeleteHoliday(int.Parse(_dataProtectionMapProvider.Unprotect(id)), userId);
            }
            catch (BusinessLogicException e)
            {
                return StatusCode(StatusCodes.Status403Forbidden, e.Message);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateHolidayStatus(int holidayId, StatusEnum status)
        {
            var userId = GetUserIdFromToken();

            try
            {
                await _holidayService.UpdateStatusHoliday(int.Parse(_dataProtectionMapProvider.Unprotect(holidayId)), status, userId);
            }
            catch (BusinessLogicException e)
            {
                return StatusCode(StatusCodes.Status403Forbidden, e.Message);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }
    }
}
