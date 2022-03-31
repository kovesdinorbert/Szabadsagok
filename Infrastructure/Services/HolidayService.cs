using Core.Entities;
using Core.Enums;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class HolidayService : IHolidayService
    {
        private readonly IGenericRepository<Holiday> _holidayRepository;
        private readonly IGenericRepository<HolidayConfig> _holidayConfigRepository;

        public HolidayService(IGenericRepository<Holiday> holidayRepository,
                              IGenericRepository<HolidayConfig> holidayConfigRepository)
        {
            _holidayRepository = holidayRepository;
            _holidayConfigRepository = holidayConfigRepository;
        }

        public async Task CreateHoliday(Holiday holiday, int currentUserId)
        {
            holiday.UserId = currentUserId;
            holiday.HolidayCount = 0;//calculation
            await _holidayRepository.CreateAsync(holiday, currentUserId);
        }

        public async Task DeleteHoliday(int holidayId)
        {
            await _holidayRepository.DeleteAsync(holidayId);
        }

        public async Task<int> GetAvailableHolidayNumber(int userId)
        {
            var maxHolidays = (await _holidayConfigRepository.FindAllAsync(hc => hc.UserId == userId)).Sum(hc => hc.MaxHoliday);
            var usedHolidays = (await _holidayRepository.FindAllAsync(h => h.UserId == userId && h.Status == StatusEnum.Accepted)).Sum(h => h.HolidayCount);
            return maxHolidays - usedHolidays;
        }

        public async Task<List<Holiday>> GetHolidaysForUser(int userId)
        {
            return await _holidayRepository.FindAllAsync(h => h.UserId == userId);
        }

        public async Task<List<Holiday>> GetFutureHolidays()
        {
            var includes = new Func<IQueryable<Holiday>, IQueryable<Holiday>>[]
            {
                source => source.Include(m => m.User),
            };

            var holidays = await _holidayRepository.FindAllAsync(h => h.End >= DateTime.Today && h.IsActive, includes);
            return holidays.OrderBy(h => h.Start).ToList();
        }

        public async Task UpdateStatusHoliday(int holidayId, StatusEnum status, int currentUserId)
        {
            var holiday = await _holidayRepository.FindByIdAsync(holidayId);
            if (holiday != null)
            {
                holiday.Status = status;
                await _holidayRepository.UpdateAsync(holiday, currentUserId);
            }
        }
    }
}
