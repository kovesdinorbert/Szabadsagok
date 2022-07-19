using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Szabadsagok.App_Conf;
using Szabadsagok.Dto;
using Szabadsagok.Helpers;

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
            var events = await _eventService.GetEvents(false, GetUserIdFromToken());

            return Ok(_mapper.Map<List<EventDto>>(events));
        }

        [HttpGet("{start}/{end}")]
        [ProducesResponseType(typeof(IEnumerable<EventDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get(DateTime start, DateTime end)
        {
            var events = await _eventService.GetEvents(start, end, GetUserIdFromToken());

            return Ok(_mapper.Map<List<EventDto>>(events));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Delete(string  id)
        {
            try
            {
                await _eventService.DeleteEvent(int.Parse(_dataProtectionMapProvider.Unprotect(id)), GetUserIdFromToken());
            }
            catch (Exception exception)
            {
                _logger.LogError("Event delete error: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            return NoContent();
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] EventDto newEvent)
        {
            try
            {
                await _eventService.AddNewEvent(_mapper.Map<Event>(newEvent), GetUserIdFromToken());
                return StatusCode(StatusCodes.Status201Created);
            }
            catch (AuthenticationException)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }
            catch (ArgumentOutOfRangeException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
