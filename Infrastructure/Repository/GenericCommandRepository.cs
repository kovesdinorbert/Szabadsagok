using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repository
{
    public class GenericCommandRepository<T> : IGenericCommandRepository<T> where T : class
    {
        private Data.SzabadsagAppContext _context = null;
        private DbSet<T> _table = null;

        public GenericCommandRepository(Data.SzabadsagAppContext context)
        {
            _context = context;
            _table = _context.Set<T>();
        }

        public async Task CreateAsync(T entity, int userId)
        {
            if (typeof(T).IsSubclassOf(typeof(_CrudBase)))
            {
                ((IHasCrud)entity).Created = DateTime.Now;
                ((IHasCrud)entity).CreatedBy = userId;
                ((IHasCrud)entity).IsActive = true;
            }
            //if (typeof(IHasId).IsAssignableFrom(typeof(T)))
            //{
            //    ((IHasId)entity).Id = new int();
            //}
            _table.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task CreateAsync(IList<T> entities, int userId)
        {
            if (typeof(T).IsSubclassOf(typeof(_CrudBase)))
            {
                foreach (var entity in entities)
                {
                    ((IHasCrud)entity).Created = DateTime.Now;
                    ((IHasCrud)entity).CreatedBy = userId;
                    ((IHasCrud)entity).IsActive = true;
                }
            }
            //if (typeof(IHasId).IsAssignableFrom(typeof(T)))
            //{
            //    ((IHasId)entity).Id = new int();
            //}
            _table.AddRange(entities);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(T entity, int userId)
        {
            if (entity == null)
            {
                //log
            }
            else
            {
                if (typeof(T).IsSubclassOf(typeof(_CrudBase)))
                {
                    ((IHasCrud)entity).IsActive = false;
                    ((IHasCrud)entity).Modified = DateTime.Now;
                    ((IHasCrud)entity).ModifiedBy = userId;
                }
                else
                {
                    _table.Remove(entity);
                }
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var ret = await _table.FindAsync(id);
            if (ret == null)
            {
                //log
            }
            else
            {
                if (typeof(T).IsSubclassOf(typeof(_CrudBase)))
                {
                    ((IHasCrud)ret).IsActive = false;
                    ((IHasCrud)ret).Modified = DateTime.Now;
                    ((IHasCrud)ret).ModifiedBy = userId;
                }
                else
                {
                    _table.Remove(_table.Find(id));
                }
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(Expression<Func<T, bool>> where, int userId)
        {
            var toDelete = _table.Where(where);

            foreach(var entity in toDelete)
            {
                if (typeof(T).IsSubclassOf(typeof(_CrudBase)))
                {
                    ((IHasCrud)entity).IsActive = false;
                    ((IHasCrud)entity).Modified = DateTime.Now;
                    ((IHasCrud)entity).ModifiedBy = userId;
                }
                else
                {
                    _table.Remove(entity);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task<List<T>> FindAllAsync(Expression<Func<T, bool>> where, params Func<IQueryable<T>, IQueryable<T>>[] includes)
        {
            var ret = _table.Where(where);
            foreach (var include in includes)
            {
                ret = include(ret);
            }
            return await Task.FromResult(ret.ToList());
        }

        public async Task<T> FindByIdAsync(int id)
        {
            var ret = await _table.FindAsync(id);
            if (ret == null)
            {
                //log
            }
            return await Task.FromResult(ret);
        }

        public async Task UpdateAsync(T entity, int userId)
        {
            if (typeof(T).IsSubclassOf(typeof(_CrudBase)))
            {
                ((IHasCrud)entity).Modified = DateTime.Now;
                ((IHasCrud)entity).ModifiedBy = userId;
            }
            _table.Update(entity);
            await _context.SaveChangesAsync();
        }
    }
}
