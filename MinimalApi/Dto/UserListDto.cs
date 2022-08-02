using Core.Enums;

namespace SzabadsagolosMinimalApi
{
    public class UserListDto: IHasIdDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public List<RoleEnum> Roles { get; set; } = new List<RoleEnum>();
        public List<HolidayForYearDto> HolidayForYears { get; set; } = new List<HolidayForYearDto>();
    }
}
