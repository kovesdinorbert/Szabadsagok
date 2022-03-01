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
        Task<List<Holiday>> GetHolidaysForUser(Guid userId);
        Task<int> GetAvailableHolidayNumber(Guid userId);
        Task CreateHoliday(Holiday holiday, Guid currentUserId);
        Task DeleteHoliday(Guid holidayId);
        Task UpdateStatusHoliday(Guid holidayId, StatusEnum status, Guid currentUserId);
    }
}
