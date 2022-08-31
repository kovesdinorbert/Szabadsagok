using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repository
{
    public class HolidayConfigQueryRepository<HolidayConfig> : IGenericQueryRepository<HolidayConfig>
    {
        public Task<List<HolidayConfig>> FindAllAsync(string where)
        {
            throw new NotImplementedException();
        }

        public Task<HolidayConfig> FindByIdAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
