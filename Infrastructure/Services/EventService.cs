using Core.Entities;
using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class EventService: IEventService
    {
        private readonly IGenericRepository<Event> _eventRepository;

        public EventService(IGenericRepository<Event> eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task AddNewEvent(Event newEvent, int userId)
        {
            await _eventRepository.CreateAsync(newEvent, userId);
        }

        public async Task DeleteEvent(int eventToDelete, int userId)
        {
            var eventEntity = await _eventRepository.FindByIdAsync(eventToDelete);

            await _eventRepository.DeleteAsync(eventEntity, userId);
        }

        public async Task UpdateEvent(Event eventToUpdate, int userId)
        {
            await _eventRepository.UpdateAsync(eventToUpdate, userId);
        }

        public async Task<List<Event>> GetEvents(bool includeNotActive, int userId)
        {
            var events = await _eventRepository.FindAllAsync(e => includeNotActive || e.IsActive);
            return events;
        }

        public async Task<List<Event>> GetEvents(DateTime start, DateTime end, int userId)
        {
            var events = await _eventRepository.FindAllAsync(e => e.StartDate >= start && e.EndDate <= end);
            return events;
        }
    }
}
