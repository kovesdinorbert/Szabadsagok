using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repository
{
    public class HolidayQueryRepository<Holiday> : IGenericQueryRepository<Holiday>
    {
        public Task<List<Holiday>> FindAllAsync(string where)
        {
            throw new NotImplementedException();
        }

        public Task<Holiday> FindByIdAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
