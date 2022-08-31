using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IGenericQueryRepository<T>
    {
        Task<T> FindByIdAsync(int id);
        Task<List<T>> FindAllAsync(string where);
    }
}
