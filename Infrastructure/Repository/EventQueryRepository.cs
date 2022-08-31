using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repository
{
    public class EventQueryRepository<Event> : IGenericQueryRepository<Event>
    {
        public Task<List<Event>> FindAllAsync(string where)
        {
            throw new NotImplementedException();
        }

        public Task<Event> FindByIdAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
