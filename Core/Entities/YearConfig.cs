using Core.Enums;
using System;

namespace Core.Entities
{
    public class YearConfig: _CrudBase
    {
        //indexet rá
        public DateTime Date { get; set; }
        public DayTypeEnum Type { get; set; }
    }
}
