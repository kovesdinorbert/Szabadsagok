using Core.Entities;
using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class YearConfigService : IYearConfigService
    {
        private readonly IGenericRepository<YearConfig> _yearConfigRepository;

        public YearConfigService(IGenericRepository<YearConfig> yearConfigRepository)
        {
            _yearConfigRepository = yearConfigRepository;
        }

        public async Task<List<YearConfig>> GetYearConfigs(int year)
        {
            var configs = await _yearConfigRepository.FindAllAsync(yc => yc.Year == year);

            return configs;
        }

        public async Task<List<YearConfig>> FillEmptyYearConfigs(int year, int currentUserId)
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

        public async Task SetYearData(List<YearConfig> yearConfigs, int currentUserId)
        {
            int year = yearConfigs.First().Date.Year;
            var oldYearConfigs = await _yearConfigRepository.FindAllAsync(yc => yc.Date.Year == year);

            foreach (var oldYearConfig in oldYearConfigs)
            {
                await _yearConfigRepository.DeleteAsync(oldYearConfig);
            }

            foreach (var yearConfig in yearConfigs)
            {
                await _yearConfigRepository.CreateAsync(yearConfig, currentUserId);
            }
        }
    }
}
