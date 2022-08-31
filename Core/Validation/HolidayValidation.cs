using Core.Entities;
using FluentValidation;
using System;

namespace Core.Validation
{
    public class HolidayValidation : AbstractValidator<Holiday>
    {
        public HolidayValidation()
        {
            RuleFor(x => x.Start).GreaterThan(DateTime.Now);
            RuleFor(x => x.Reason).NotEmpty();
            RuleFor(m => new { m.Start, m.End }).Must(x => StartEnd(x.Start, x.End));
        }

        private bool StartEnd(DateTime start, DateTime end)
        {
            return start < end;
        }
    }
}
