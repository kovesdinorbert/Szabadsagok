using Core.Enums;
using System;

namespace Szabadsagok.Dto
{
    public class YearConfigDto: IHasIdDto
    {
        public string Id { get; set; }
        public int Year { get; set; }
        public DateTime Date { get; set; }
        public DayTypeEnum Type { get; set; }
    }
}
