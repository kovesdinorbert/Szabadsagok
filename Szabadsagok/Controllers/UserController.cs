using AutoMapper;
using Core.Entities;
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
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : Controller
    {
        //private readonly ILogger<UserController> _logger;
        private readonly IUserService _userService;
        //private readonly IEventService _eventService;
        private readonly IMapper _mapper;

        public UserController(//ILogger<UserController> logger,
                              IUserService userService,
                              //IEventService eventService,
                              IMapper mapper)
        {
            //_logger = logger;
            _userService = userService;
            _mapper = mapper;
            //_eventService = eventService;
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        [ProducesResponseType(typeof(LoginResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Authenticate(/*[FromBody] LoginDto login*/)
        {
            //var user = await _userService.Login(login.Email, login.Password);
            var user = await _userService.GetUser(Guid.Parse("5eb91753-55b5-413a-8975-b34f610dcc6a"));
            if (user != null)
            {
                var token = await _userService.GenerateToken(user);
                return Ok(new LoginResultDto() { Email = user.Email, Id = user.Id, Token = token });
            }

            return Unauthorized();
        }

        [HttpGet]
        public async Task<IActionResult> GetUser()
        {
            return View();
        }

        [HttpGet("getallusers")]
        [ProducesResponseType(typeof(IEnumerable<UserListDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllUsers()
        {
            var idStr = ClaimHelper.GetClaimData(User, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !Guid.TryParse(idStr, out var userId))
            {
                return Unauthorized();
            }

            List<UserListDto> ret;
            try
            {
                ret = _mapper.Map<List<UserListDto>>(await _userService.GetUsers());
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok(ret);
        }

        [HttpPost("setholiday/{userId}")]
        public async Task<IActionResult> SetHoliday(Guid userId)
        {
            return View();
        }

        [HttpPost("updateuser")]
        [ProducesResponseType(typeof(UserDataDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateUser(UserDataDto userData)
        {
            var idStr = ClaimHelper.GetClaimData(User, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !Guid.TryParse(idStr, out var userId))
            {
                return Unauthorized();
            }

            UserDataDto ret;

            try
            {
                var user = _mapper.Map<User>(userData);
                await _userService.UpdateUser(user, userId);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }

        [HttpPut("createuser")]
        [ProducesResponseType(typeof(UserDataDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateUser(UserDataDto userData)
        {
            var idStr = ClaimHelper.GetClaimData(User, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !Guid.TryParse(idStr, out var userId))
            {
                return Unauthorized();
            }

            UserDataDto ret;

            try
            {
                ret =_mapper.Map<UserDataDto>(await _userService.CreateUser(userData.Name, userData.Email, userId));
                if (ret == null || ret.Id == Guid.Empty)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok(ret);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var idStr = ClaimHelper.GetClaimData(User, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !Guid.TryParse(idStr, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                await _userService.DeactivateUser(id, userId);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }
    }
}
