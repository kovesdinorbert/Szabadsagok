using Core.Enums;
using System;
using System.Collections.Generic;

namespace Szabadsagok.Dto
{
    public class UserDataDto : IHasIdDto
    {
        public string Id { get; set; }   
        public string Name { get; set; }
        public string Email { get; set; }
        public List<RoleEnum> Roles { get; set; } = new List<RoleEnum>();
        public List<HolidayForYearDto> HolidayConfigs { get; set; } = new List<HolidayForYearDto>();
    }
}
