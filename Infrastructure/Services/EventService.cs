using Core.Entities;
using Core.Interfaces;
using ErrorOr;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class EventService: IEventService
    {
        private readonly IGenericCommandRepository<Event> _eventRepository;

        public EventService(IGenericCommandRepository<Event> eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<Event> AddNewEvent(Event newEvent, int userId)
        {
            await _eventRepository.CreateAsync(newEvent, userId);
            return newEvent;
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

        public async Task<ErrorOr<List<Event>>> GetEvents(bool includeNotActive)
        {
            var events = await _eventRepository.FindAllAsync(e => includeNotActive || e.IsActive);
            return events;
        }

        public async Task<ErrorOr<List<Event>>> GetEvents(DateTime start, DateTime end)
        {
            var events = await _eventRepository.FindAllAsync(e => e.StartDate >= start && e.EndDate <= end);
            return events;
        }
    }
}
