using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IGenericRepository<T>
    {
        Task<T> FindByIdAsync(int id);
        Task<List<T>> FindAllAsync(Expression<Func<T, bool>> where, params Func<IQueryable<T>, IQueryable<T>>[] includes);
        Task CreateAsync(T entity, int userId);
        Task CreateAsync(IList<T> entities, int userId);
        Task UpdateAsync(T entity, int userId);
        Task DeleteAsync(T entity, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
