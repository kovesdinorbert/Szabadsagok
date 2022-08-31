using Core.Entities;
using Core.Interfaces;
using ErrorOr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class YearConfigService : IYearConfigService
    {
        private readonly IGenericCommandRepository<YearConfig> _yearConfigRepository;

        public YearConfigService(IGenericCommandRepository<YearConfig> yearConfigRepository)
        {
            _yearConfigRepository = yearConfigRepository;
        }

        public async Task<ErrorOr<List<YearConfig>>> GetYearConfigs(int year, int currentUserId)
        {
            var configs = await _yearConfigRepository.FindAllAsync(yc => yc.Year == year);

            if (!configs.Any())
            {
                await FillEmptyYearConfigs(year, currentUserId);
                configs = await _yearConfigRepository.FindAllAsync(yc => yc.Year == year);
            }

            return configs;
        }

        public async Task<ErrorOr<List<YearConfig>>> GetYearConfigs(DateTime start, DateTime end, int currentUserId)
        {
            var configs = await _yearConfigRepository.FindAllAsync(yc => yc.Date >= start && yc.Date <= end);

            if (!configs.Any())
            {
                await FillEmptyYearConfigs(start.Year, currentUserId);
                if (start.Year != end.Year)
                {
                    await FillEmptyYearConfigs(end.Year, currentUserId);
                }
                configs = await _yearConfigRepository.FindAllAsync(yc => yc.Date >= start && yc.Date <= end);
            }

            return configs;
        }

        public async Task<ErrorOr<List<YearConfig>>> FillEmptyYearConfigs(int year, int currentUserId)
        {
            var ret = new List<YearConfig>();

            var firstDay = new DateTime(year, 1, 1 );
            var lastDay = new DateTime(year, 12, 31 );
            for (var date = firstDay; date <= lastDay; date = date.AddDays(1))
            {
                ret.Add(new YearConfig()
                {
                    Year = year,
                    Date = date,
                    Type = (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) 
                                ? Core.Enums.DayTypeEnum.Weekend 
                                : Core.Enums.DayTypeEnum.Workday
                }); 
            }

            await _yearConfigRepository.CreateAsync(ret, currentUserId);

            return ret;
        }

        public async Task SetYearData(YearConfig yearConfig, int currentUserId)
        {
            var yearData = (await _yearConfigRepository.FindAllAsync(yc => yc.Year == yearConfig.Year)).ToList();
            if (!yearData.Any())
            {
                await FillEmptyYearConfigs(yearConfig.Year, currentUserId);
                yearData = (await _yearConfigRepository.FindAllAsync(yc => yc.Year == yearConfig.Year)).ToList();
            }

            var yc = yearData.FirstOrDefault(yc => yc.Year == yearConfig.Year 
                                                   && yc.Date.Date == yearConfig.Date.Date);

            if (yc != null)
            {
                yc.Type = yearConfig.Type;
                await _yearConfigRepository.UpdateAsync(yc, currentUserId);
            }
            else
            {
                throw new Exception("Nincs a módosítani kívánt dátum az adatbázisban! Nem lehetséges.");
            }
        }
    }
}
