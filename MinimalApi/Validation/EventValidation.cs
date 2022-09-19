using FluentValidation;

namespace MinimalApi.Helpers.Validation
{
    public class EventValidation : AbstractValidator<EventDto>
    {
        public EventValidation()
        {
            RuleFor(x => x.StartDate).GreaterThan(DateTime.Now).WithMessage("A dátum legyen jövőbeli");
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(m => new { m.StartDate, m.EndDate }).Must(x => StartEnd(x.StartDate, x.EndDate)).WithMessage("A vége dátumnak a kezdet utáninak kell lennie");
        }

        private bool StartEnd(DateTime start, DateTime end)
        {
            return start < end;
        }
    }
}
