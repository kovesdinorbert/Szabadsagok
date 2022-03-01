using Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IYearConfigService
    {
        Task SetYearData(List<YearConfig> yearConfigs, Guid currentUserId);
        Task<List<YearConfig>> GetYearConfigs(int year);
    }
}
