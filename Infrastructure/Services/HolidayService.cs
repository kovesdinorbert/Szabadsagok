using Core.Entities;
using Core.Enums;
using Core.Errors;
using Core.Interfaces;
using ErrorOr;
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
        private readonly IYearConfigService _yearConfigService;

        public HolidayService(IGenericRepository<Holiday> holidayRepository,
                              IGenericRepository<HolidayConfig> holidayConfigRepository,
                              IYearConfigService yearConfigService)
        {
            _holidayRepository = holidayRepository;
            _holidayConfigRepository = holidayConfigRepository;
            _yearConfigService = yearConfigService;
        }

        public async Task<ErrorOr<bool>> CreateHoliday(Holiday holiday, int currentUserId)
        {
            var requestedHolidays = (await _holidayRepository.FindAllAsync(h => h.UserId == currentUserId 
                                                                             && h.Status == StatusEnum.Requested));
            if (requestedHolidays.Any())
            {
                return HolidayErrors.FoundOpenedStatusHolidayRequest;
            }

            var yearconfigsResult = await _yearConfigService.GetYearConfigs(holiday.Start, holiday.End);

            if (yearconfigsResult.IsError)
            {
                return yearconfigsResult.FirstError;
            }

            holiday.UserId = currentUserId;
            holiday.HolidayCount = yearconfigsResult.Value.Where(yc => yc.Type == DayTypeEnum.Workday).Count();

            var getAvailableHolidayNumberResult = await GetAvailableHolidayNumber(currentUserId);
            if (getAvailableHolidayNumberResult.IsError)
            {
                return getAvailableHolidayNumberResult.FirstError;
            }

            if (getAvailableHolidayNumberResult.Value - holiday.HolidayCount >= 0)
            {
                await _holidayRepository.CreateAsync(holiday, currentUserId);
                return true;
            }
            else
            {
                return HolidayErrors.NotEnoughAvailableHolidays;
            }
        }

        public async Task<ErrorOr<bool>> DeleteHoliday(int holidayId, int currentUserId)
        {
            var holiday = await _holidayRepository.FindByIdAsync(holidayId);
            if (holiday == null ) throw new ArgumentNullException(nameof(holiday));
            if (holiday.Start.Date <= DateTime.Now.Date)
            {
                return HolidayErrors.HolidayAlreadyStarted;
            }

            holiday.Status = StatusEnum.Deleted;
            await _holidayRepository.UpdateAsync(holiday, currentUserId);
            return true;
        }

        public async Task<ErrorOr<int>> GetAvailableHolidayNumber(int userId)
        {
            var maxHolidays = (await _holidayConfigRepository.FindAllAsync(hc => hc.UserId == userId)).Sum(hc => hc.MaxHoliday);
            var usedHolidays = (await _holidayRepository.FindAllAsync(h => h.UserId == userId && h.Status == StatusEnum.Accepted)).Sum(h => h.HolidayCount);
            return maxHolidays - usedHolidays;
        }

        public async Task<ErrorOr<List<Holiday>>> GetHolidaysForUser(int userId)
        {
            return await _holidayRepository.FindAllAsync(h => h.UserId == userId);
        }

        public async Task<ErrorOr<List<Holiday>>> GetFutureHolidays()
        {
            var includes = new Func<IQueryable<Holiday>, IQueryable<Holiday>>[]
            {
                source => source.Include(m => m.User),
            };

            var holidays = await _holidayRepository.FindAllAsync(h => h.End >= DateTime.Today && h.IsActive, includes);
            return holidays.OrderBy(h => h.Start).ToList();
        }

        public async Task<ErrorOr<bool>> UpdateStatusHoliday(int holidayId, StatusEnum status, int currentUserId)
        {
            var holiday = await _holidayRepository.FindByIdAsync(holidayId);
            if (holiday == null) throw new ArgumentNullException(nameof(holiday));
            if (holiday.Status != StatusEnum.Requested)
            {
                return HolidayErrors.HolidayStatusIsNotRequired;
            }

            holiday.Status = status;
            await _holidayRepository.UpdateAsync(holiday, currentUserId);
            return true;
        }
    }
}
