﻿using System;

namespace Szabadsagok.Dto
{
    public class HolidayRequestDto
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Reason { get; set; }
    }
}
