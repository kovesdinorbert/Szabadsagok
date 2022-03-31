using System;

namespace Core.Entities
{
    public class HolidayConfig: _CrudBase
    {
        public int Year { get; set; }
        public int MaxHoliday { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
