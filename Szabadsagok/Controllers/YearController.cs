using AutoMapper;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Szabadsagok.Dto;
using Szabadsagok.Helpers;

namespace Szabadsagok.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class YearController : BaseController
    {
        private readonly IYearConfigService _yearConfigService;
        private readonly IMapper _mapper;

        public YearController(IYearConfigService yearConfigService,
                              IMapper mapper)
        {
            _yearConfigService = yearConfigService;
            _mapper = mapper;
        }

        [HttpGet("{year}")]
        [ProducesResponseType(typeof(IEnumerable<List<YearConfigDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetYear(int year)
        {
            var userId = GetUserIdFromToken();

            List<YearConfigDto> ret;
            try
            {
                ret = _mapper.Map<List<YearConfigDto>>(await _yearConfigService.GetYearConfigs(year));

                if (!ret.Any())
                {
                    ret = _mapper.Map<List<YearConfigDto>>(await _yearConfigService.FillEmptyYearConfigs(year, userId));
                }
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok(ret);
        }

        [HttpPost]
        [ProducesResponseType(typeof(YearConfigDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SetYearData(YearConfigDto yearConfig)
        {
            var userId = GetUserIdFromToken();

            YearConfigDto ret;

            try
            {
                var dayConfig = _mapper.Map<YearConfig>(yearConfig);
                await _yearConfigService.SetYearData(dayConfig, userId);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }
    }
}
