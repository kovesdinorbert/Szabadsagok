using Core.Enums;
using Core.Interfaces;
using System;

namespace Core.Entities
{
    public class Holiday: _CrudBase
    {
        public int Year { get; set; }
        public int HolidayCount { get; set; }
        public string Reason { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public StatusEnum Status { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
