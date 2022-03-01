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

        public async Task CreateHoliday(Holiday holiday, Guid currentUserId)
        {
            holiday.UserId = currentUserId;
            holiday.HolidayCount = 0;//calculation
            await _holidayRepository.CreateAsync(holiday, currentUserId);
        }

        public async Task DeleteHoliday(Guid holidayId)
        {
            await _holidayRepository.DeleteAsync(holidayId);
        }

        public async Task<int> GetAvailableHolidayNumber(Guid userId)
        {
            var maxHolidays = (await _holidayConfigRepository.FindAllAsync(hc => hc.UserId == userId)).Sum(hc => hc.MaxHoliday);
            var usedHolidays = (await _holidayRepository.FindAllAsync(h => h.UserId == userId && h.Status == StatusEnum.Accepted)).Sum(h => h.HolidayCount);
            return maxHolidays - usedHolidays;
        }

        public async Task<List<Holiday>> GetHolidaysForUser(Guid userId)
        {
            return await _holidayRepository.FindAllAsync(h => h.UserId == userId);
        }

        public async Task<List<Holiday>> GetFutureHolidays()
        {
            var includes = new Func<IQueryable<Holiday>, IQueryable<Holiday>>[]
            {
                source => source.Include(m => m.User),
            };
            return await _holidayRepository.FindAllAsync(h => h.Start >= DateTime.Today && h.IsActive, includes);
        }

        public async Task UpdateStatusHoliday(Guid holidayId, StatusEnum status, Guid currentUserId)
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
