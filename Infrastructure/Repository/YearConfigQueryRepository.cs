using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repository
{
    public class YearConfigQueryRepository<YearConfig> : IGenericQueryRepository<YearConfig>
    {
        public Task<List<YearConfig>> FindAllAsync(string where)
        {
            throw new NotImplementedException();
        }

        public Task<YearConfig> FindByIdAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
