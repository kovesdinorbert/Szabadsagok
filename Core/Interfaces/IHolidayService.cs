using Core.Entities;
using Core.Enums;
using ErrorOr;
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
        Task<ErrorOr<bool>> CreateHoliday(Holiday holiday, int currentUserId);
        Task<ErrorOr<bool>> DeleteHoliday(int holidayId, int currentUserId);
        Task<ErrorOr<bool>> UpdateStatusHoliday(int holidayId, StatusEnum status, int currentUserId);
    }
}
