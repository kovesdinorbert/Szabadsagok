using MapsterMapper;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Szabadsagok.App_Conf;
using Szabadsagok.Dto;
using System.Linq;

namespace Szabadsagok.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : BaseController
    {
        private readonly IUserService _userService;
        private readonly IDataProtectionMapProvider _dataProtectionMapProvider;
        private readonly IMapper _mapper;

        public UserController(IUserService userService,
                              IDataProtectionMapProvider dataProtectionMapProvider,
                              IMapper mapper)
        {
            _userService = userService;
            _dataProtectionMapProvider = dataProtectionMapProvider;
            _mapper = mapper;
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        [ProducesResponseType(typeof(LoginResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Authenticate([FromBody] LoginResultDto login)
        {
            //var user = await _userService.Login(login.Email, login.Password);
            var userResult = await _userService.GetUserByEmail(login.Email);

            var token = "";

            if (!userResult.Errors.Any())
            {
                token = await _userService.GenerateToken(userResult.Value);
            }

            return userResult.MatchFirst<IActionResult>(user => Ok(new LoginResultDto()
            {
                Email = user.Email,
                Id = user.Id.ToString(),
                Token = token
            }),
                                                        error => Unauthorized());
        }

        //[HttpGet]
        //public async Task<IActionResult> GetUser()
        //{
        //    return Ok();
        //}

        [HttpGet("getallusers")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(IEnumerable<UserListDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllUsers()
        {
            return Ok("OK");
        }

        [HttpPost("setholiday/{userId}/{year}/{count}")]
        [ProducesResponseType(typeof(UserDataDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SetHoliday(int userId, int year, int count)
        {
            await _userService.SetHolidayConfig(year, count, userId, GetUserIdFromToken());

            return Ok();
        }

        [HttpPost("updateuser")]
        [ProducesResponseType(typeof(UserDataDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateUser(UserDataDto userData)
        {
            var result = await _userService.UpdateUser(_mapper.Map<User>(userData), GetUserIdFromToken());

            return result.MatchFirst(result => Ok(),
                                     error => BusinessError(error));
        }

        [HttpPut("createuser")]
        [ProducesResponseType(typeof(UserDataDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateUser(UserDataDto userData)
        {
            var result = await _userService.CreateUser(userData.Name, userData.Email, userData.Roles, GetUserIdFromToken());

            return result.MatchFirst(result => Ok(_mapper.Map<UserDataDto>(result)),
                                     error => BusinessError(error));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            await _userService.DeactivateUser(int.Parse(_dataProtectionMapProvider.Unprotect(id)), GetUserIdFromToken());

            return Ok();
        }
    }
}
