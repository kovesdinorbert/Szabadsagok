using Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IEventService
    {
        Task<List<Event>> GetEvents(bool includeNotActive, int userId);
        Task<List<Event>> GetEvents(DateTime start, DateTime end, int userId);
        Task AddNewEvent(Event newEvent, int userId);
        Task DeleteEvent(int eventToDelete, int userId);
        Task UpdateEvent(Event eventToUpdate, int userId);
    }
}
