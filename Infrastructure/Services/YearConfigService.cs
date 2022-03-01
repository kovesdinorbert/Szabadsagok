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
            return await _yearConfigRepository.FindAllAsync(yc => yc.Date.Year == year);
        }

        public async Task SetYearData(List<YearConfig> yearConfigs, Guid currentUserId)
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
