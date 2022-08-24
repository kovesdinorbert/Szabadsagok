using Core.Entities;
using ErrorOr;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IYearConfigService
    {
        Task SetYearData(YearConfig yearConfig, int currentUserId);
        Task<ErrorOr<List<YearConfig>>> GetYearConfigs(int year, int currentUserId);
        Task<ErrorOr<List<YearConfig>>> GetYearConfigs(DateTime start, DateTime end, int currentUserId);
        Task<ErrorOr<List<YearConfig>>> FillEmptyYearConfigs(int year, int currentUserId);
    }
}
