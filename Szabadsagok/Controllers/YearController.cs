using MapsterMapper;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Szabadsagok.Dto;

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
            var yearConfigResult = await _yearConfigService.GetYearConfigs(year);

            if (!yearConfigResult.IsError && yearConfigResult.Value.Any())
            {
                var result = await _yearConfigService.FillEmptyYearConfigs(year, GetUserIdFromToken());

                return yearConfigResult.MatchFirst(result => Ok(_mapper.Map<List<YearConfigDto>>(result)),
                                                   error => BusinessError(error));
            }
            return NotFound();
        }

        [HttpPost]
        [ProducesResponseType(typeof(YearConfigDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SetYearData(YearConfigDto yearConfig)
        {
            var dayConfig = _mapper.Map<YearConfig>(yearConfig);
            await _yearConfigService.SetYearData(dayConfig, GetUserIdFromToken());

            return Ok(dayConfig);
        }
    }
}
