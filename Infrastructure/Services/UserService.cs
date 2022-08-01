using Core.Configuration;
using Core.Entities;
using Core.Enums;
using Core.Errors;
using Core.Interfaces;
using ErrorOr;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<HolidayConfig> _holidayConfigRepository;
        private readonly AppConfiguration _appConfiguration;

        public UserService(IGenericRepository<User> userRepository,
                           IGenericRepository<HolidayConfig> holidayConfigRepository,
                           IOptions<AppConfiguration> appConfiguration)
        {
            _userRepository = userRepository;
            _holidayConfigRepository = holidayConfigRepository;
            _appConfiguration = appConfiguration.Value;
        }

        public async Task<string> GenerateToken(User user)
        {
            await Task.Delay(0);
            var secretKey = Encoding.UTF8.GetBytes(_appConfiguration.SecretKey);
            var signinCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature);

            var tokenOptions = new JwtSecurityToken(
                //issuer: _tokenValidationConfiguration.ValidIssuer,
                //audience: _tokenValidationConfiguration.ValidAudience,
                claims: GenerateClaims(user),
                expires: DateTime.Now.AddDays(1),
                signingCredentials: signinCredentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return tokenString;
        }

        private List<Claim> GenerateClaims(User user)
        {
            var claims = new List<Claim>();

            //foreach (var userRole in user.Role)
            //{
                claims.Add(new Claim(ClaimTypes.Role, string.Concat(user.Roles.Select(r => r.ToString()))));
                claims.Add(new Claim(ClaimTypes.Email, user.Email));
                claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
            //}
            claims.Add(new Claim(ClaimTypes.Name, user.Email));

            return claims;
        }

        public async Task<List<User>> GetUsers()
        {
            var users = await _userRepository.FindAllAsync(u => !u.Deleted, u => u.Include(h => h.Holidays).Include(h => h.HolidayConfigs));

            return users;
        }

        public async Task<User> GetUser(int userId)
        {
            return await _userRepository.FindByIdAsync(userId);
        }

        public async Task<ErrorOr<User>> GetUserByEmail(string email)
        {
            var users = await _userRepository.FindAllAsync(u => u.Email.ToLower() == email.ToLower() && !u.Deleted,
                                                           u => u.Include(m => m.Holidays));

            if (users.Any())
            {
                return users.FirstOrDefault();
            }
            else
            {

                return UserErrors.UserNotFound;
            }
        }

        public async Task<ErrorOr<User>> CreateUser(string name, string email, List<RoleEnum> roles, int currentUserId)
        {
            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(email))
                return UserErrors.NameAndEmailRequired;

            var user = new User()
            {
                Deleted = false,
            };
            user.Roles = roles == null || !roles.Any() ? new List<RoleEnum>() { RoleEnum.Common} : roles;
            user.Name = name;
            user.Email = email;

            await _userRepository.CreateAsync(user, currentUserId);

            return user;
        }

        public async Task<ErrorOr<bool>> UpdateUser(User user, int currentUserId)
        {
            return UserErrors.NameAndEmailRequired;

            if (user.Id <= 0)
                throw new ArgumentNullException(nameof(user.Id));

            var dbuser = await _userRepository.FindByIdAsync(user.Id);
            if (dbuser == null)
                throw new ArgumentNullException(nameof(user));

            dbuser.Name = user.Name;
            dbuser.Email = user.Email;
            dbuser.Roles = user.Roles;
            await _userRepository.UpdateAsync(dbuser, currentUserId);

            await CreateHolidayConfigs(user.HolidayConfigs.ToList(), dbuser.Id, currentUserId);
            return true;
        }

        private async Task CreateHolidayConfigs(List<HolidayConfig> holidayConfigs, int userId, int currentUserId)
        {
            foreach (var hcs in holidayConfigs.Where(hc => hc.Year > 0 && hc.MaxHoliday > 0))
            {
                var existingConfigQ = await _holidayConfigRepository.FindAllAsync(hc => hc.UserId == hcs.UserId
                                                                                       && hc.Year == hcs.Year);
                var existingConfig = existingConfigQ.FirstOrDefault();
                if (existingConfig != null)
                {
                    await _holidayConfigRepository.CreateAsync(new HolidayConfig()
                    {
                        MaxHoliday = hcs.MaxHoliday,
                        Year = hcs.Year,
                        UserId = userId,
                    }, currentUserId);
                } 
                else
                {
                    existingConfig.MaxHoliday = hcs.MaxHoliday;
                    await _holidayConfigRepository.UpdateAsync(existingConfig, currentUserId);
                }
            }
        }

        public async Task DeactivateUser(int userId, int currentUserId)
        {
            var user = await GetUser(userId);
            if (user != null)
            {
                user.Deleted = true;
                await _userRepository.UpdateAsync(user, currentUserId);
            }
        }

        public async Task SetHolidayConfig(int year, int maxHolidays, int userId, int currentUserId)
        {
            var holidayConfig = (await _holidayConfigRepository.FindAllAsync(hc => hc.UserId == userId && hc.Year == year)).FirstOrDefault();
            
            if (holidayConfig != null)
            {
                holidayConfig.MaxHoliday = maxHolidays;
                await _holidayConfigRepository.UpdateAsync(holidayConfig, currentUserId);
            }
            else
            {
                await _holidayConfigRepository.CreateAsync(new HolidayConfig()
                { 
                    MaxHoliday = maxHolidays, 
                    UserId = userId, 
                    Year = year 
                },
                currentUserId);
            }
        }
    }
}
