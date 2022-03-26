using Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IUserService
    {
        Task<string> GenerateToken(User user);
        Task<User> CreateUser(string name, string email, Guid currentUserId);
        Task UpdateUser(User user, Guid currentUserId);
        Task<List<User>> GetUsers();
        Task<User> GetUser(Guid userId);
        Task<User> GetUserByEmail(string email);
        Task DeactivateUser(Guid userId, Guid currentUserId);
        Task SetHolidayConfig(int year, int maxHolidays, Guid userId, Guid currentUserId);
    }
}
