using System;
using System.Collections.Generic;

namespace Szabadsagok.Dto
{
    public class UserDataDto : IHasIdDto
    {
        public string Id { get; set; }   
        public string Name { get; set; }
        public string Email { get; set; }
        public List<HolidayForYearDto> HolidayForYears { get; set; } = new List<HolidayForYearDto>();
    }
}
