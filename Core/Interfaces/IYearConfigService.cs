using Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IYearConfigService
    {
        Task SetYearData(YearConfig yearConfig, int currentUserId);
        Task<List<YearConfig>> GetYearConfigs(int year);
        Task<List<YearConfig>> GetYearConfigs(DateTime start, DateTime end);
        Task<List<YearConfig>> FillEmptyYearConfigs(int year, int currentUserId);
    }
}
