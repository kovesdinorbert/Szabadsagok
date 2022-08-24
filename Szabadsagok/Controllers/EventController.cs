using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Szabadsagok.App_Conf;
using Szabadsagok.Dto;

namespace Szabadsagok.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : BaseController
    {
        private readonly ILogger<EventController> _logger;
        private readonly IEventService _eventService;
        private readonly IMapper _mapper;
        private readonly IDataProtectionMapProvider _dataProtectionMapProvider;

        public EventController(ILogger<EventController> logger,
                               IEventService eventService,
                               IDataProtectionMapProvider dataProtectionMapProvider,
                               IMapper mapper)
        {
            _logger = logger;
            _eventService = eventService;
            _dataProtectionMapProvider = dataProtectionMapProvider;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EventDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get()
        {
            var result = await _eventService.GetEvents(false);

            return result.MatchFirst(result => Ok(_mapper.Map<List<EventDto>>(result)),
                                     error => BusinessError(error));
        }

        [HttpGet("{start}/{end}")]
        [ProducesResponseType(typeof(IEnumerable<EventDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get(DateTime start, DateTime end)
        {
            var result = await _eventService.GetEvents(start, end);

            return result.MatchFirst(result => Ok(_mapper.Map<List<EventDto>>(result)),
                                     error => BusinessError(error));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Delete(string  id)
        {
            await _eventService.DeleteEvent(int.Parse(_dataProtectionMapProvider.Unprotect(id)), GetUserIdFromToken());

            return NoContent();
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] EventDto newEvent)
        {
            await _eventService.AddNewEvent(_mapper.Map<Event>(newEvent), GetUserIdFromToken());

            return StatusCode(StatusCodes.Status201Created);
        }
    }
}
