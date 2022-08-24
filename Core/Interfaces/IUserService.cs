using Core.Entities;
using Core.Enums;
using ErrorOr;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IUserService
    {
        Task<string> GenerateToken(User user);
        Task<ErrorOr<User>> CreateUser(string name, string email, List<RoleEnum> roles, int currentUserId);
        Task<ErrorOr<bool>> UpdateUser(User user, int currentUserId);
        Task<ErrorOr<List<User>>> GetUsers();
        Task<ErrorOr<User>> GetUser(int userId);
        Task<ErrorOr<User>> GetUserByEmail(string email);
        Task DeactivateUser(int userId, int currentUserId);
        Task SetHolidayConfig(int year, int maxHolidays, int userId, int currentUserId);
    }
}
