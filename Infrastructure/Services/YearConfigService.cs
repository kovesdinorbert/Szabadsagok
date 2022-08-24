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
        private readonly IGenericRepository<YearConfig> _yearConfigRepository;

        public YearConfigService(IGenericRepository<YearConfig> yearConfigRepository)
        {
            _yearConfigRepository = yearConfigRepository;
        }

        public async Task<ErrorOr<List<YearConfig>>> GetYearConfigs(int year)
        {
            var configs = await _yearConfigRepository.FindAllAsync(yc => yc.Year == year);

            return configs;
        }

        public async Task<ErrorOr<List<YearConfig>>> GetYearConfigs(DateTime start, DateTime end)
        {
            var configs = await _yearConfigRepository.FindAllAsync(yc => yc.Date >= start && yc.Date <= end);

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
            var yc = (await _yearConfigRepository.FindAllAsync(yc => yc.Year == yearConfig.Year 
                                                                     && yc.Date.Date == yearConfig.Date.Date)).FirstOrDefault();

            if (yc != null)
            {
                yc.Type = yearConfig.Type;
                await _yearConfigRepository.UpdateAsync(yc, currentUserId);
            }
            else
            {
                await _yearConfigRepository.CreateAsync(yearConfig, currentUserId);
            }
        }
    }
}
