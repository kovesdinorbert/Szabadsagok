using AutoMapper;
using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Szabadsagok.Dto;
using Szabadsagok.Helpers;

namespace Szabadsagok.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HolidayController : Controller
    {
        private readonly IHolidayService _holidayService;
        private readonly IUserService _userService;
        private readonly IMapper _mapper;

        public HolidayController(IHolidayService holidayService,
                                 IUserService userService,
                                 IMapper mapper)
        {
            _holidayService = holidayService;
            _userService = userService;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<IncomingHolidayDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllFutureHolidays()
        {
            var idStr = ClaimHelper.GetClaimData(User, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !Guid.TryParse(idStr, out var userId))
            {
                return Unauthorized();
            }

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

        [HttpGet("holidayforuser/{id}")]
        public async Task<IActionResult> GetHolidaysForUser(Guid userId)
        {
            return View();
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateHoliday(HolidayRequestDto requestDto)
        {
            var idStr = ClaimHelper.GetClaimData(User, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !Guid.TryParse(idStr, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                await _holidayService.CreateHoliday(_mapper.Map<Holiday>(requestDto), userId);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteHoliday(Guid userId, DateTime start, DateTime end)
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> UpdateHolidayStatus(Guid holidayId, StatusEnum status)
        {
            return View();
        }
    }
}
