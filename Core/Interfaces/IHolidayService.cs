using Core.Entities;
using Core.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IHolidayService
    {
        Task<List<Holiday>> GetFutureHolidays();
        Task<List<Holiday>> GetHolidaysForUser(int userId);
        Task<int> GetAvailableHolidayNumber(int userId);
        Task CreateHoliday(Holiday holiday, int currentUserId);
        Task DeleteHoliday(int holidayId, int currentUserId);
        Task UpdateStatusHoliday(int holidayId, StatusEnum status, int currentUserId);
    }
}
