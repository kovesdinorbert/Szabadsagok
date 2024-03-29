﻿using Core.Enums;
using System;

namespace Core.Entities
{
    public class YearConfig: _CrudBase
    {   
        public int Year { get; set; }
        public DateTime Date { get; set; }
        public DayTypeEnum Type { get; set; }
    }
}
