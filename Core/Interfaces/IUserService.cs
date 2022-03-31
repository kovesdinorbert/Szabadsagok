using Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IUserService
    {
        Task<string> GenerateToken(User user);
        Task<User> CreateUser(string name, string email, int currentUserId);
        Task UpdateUser(User user, int currentUserId);
        Task<List<User>> GetUsers();
        Task<User> GetUser(int userId);
        Task<User> GetUserByEmail(string email);
        Task DeactivateUser(int userId, int currentUserId);
        Task SetHolidayConfig(int year, int maxHolidays, int userId, int currentUserId);
    }
}
