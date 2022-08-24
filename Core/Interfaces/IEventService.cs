using Core.Entities;
using ErrorOr;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IEventService
    {
        Task<ErrorOr<List<Event>>> GetEvents(bool includeNotActive);
        Task<ErrorOr<List<Event>>> GetEvents(DateTime start, DateTime end);
        Task AddNewEvent(Event newEvent, int userId);
        Task DeleteEvent(int eventToDelete, int userId);
        Task UpdateEvent(Event eventToUpdate, int userId);
    }
}
