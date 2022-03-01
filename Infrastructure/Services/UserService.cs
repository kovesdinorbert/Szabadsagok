using Core.Configuration;
using Core.Entities;
using Core.Interfaces;
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
                claims.Add(new Claim(ClaimTypes.Role, user.Role.ToString()));
                claims.Add(new Claim(ClaimTypes.Email, user.Email));
                claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
            //}
            claims.Add(new Claim(ClaimTypes.Name, user.Email));

            return claims;
        }

        public async Task<List<User>> GetUsers()
        {
            var users = await _userRepository.FindAllAsync(u => !u.Deleted, u => u.Include(h => h.Holidays));

            return users;
        }

        public async Task<User> GetUser(Guid userId)
        {
            return await _userRepository.FindByIdAsync(userId);
        }

        public async Task<User> GetUserByEmail(string email)
        {
            var users = await _userRepository.FindAllAsync(u => u.Email.ToLower() == email.ToLower() && !u.Deleted,
                                                           u => u.Include(m => m.Holidays));

            try
            {
                return users.Single();
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task CreateUser(string name, string email, Guid currentUserId)
        {
            if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(email))
            {
                await _userRepository.CreateAsync(new User()
                {
                    Name = name,
                    Email = email,
                    Deleted = false,
                    Role = Core.Enums.RoleEnum.Common
                }, currentUserId);
            }
        }

        public async Task UpdateUser(Guid userId, string name, string email, Guid currentUserId)
        {
            if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(email))
            {
                var user = await _userRepository.FindByIdAsync(userId); 
                if (user != null)
                {
                    user.Name = name;
                    user.Email = email;
                    await _userRepository.UpdateAsync(user, currentUserId);
                }
            }
        }

        public async Task DeactivateUser(Guid userId, Guid currentUserId)
        {
            var user = await GetUser(userId);
            if (user != null)
            {
                user.Deleted = true;
                await _userRepository.UpdateAsync(user, currentUserId);
            }
        }

        public async Task SetHolidayConfig(int year, int maxHolidays, Guid userId, Guid currentUserId)
        {
            var holidayConfig = (await _holidayConfigRepository.FindAllAsync(hc => hc.UserId == userId && hc.Year == year)).FirstOrDefault();
            if (holidayConfig != null)
            {
                holidayConfig.MaxHoliday = maxHolidays;
                await _holidayConfigRepository.UpdateAsync(holidayConfig, currentUserId);
            }
        }
    }
}
