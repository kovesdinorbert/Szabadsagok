
namespace SzabadsagolosMinimalApi
{
    public class HolidayForYearDto: IHasIdDto
    {
        public string Id { get; set; }
        public int Year { get; set; }
        public int MaxHoliday { get; set; }
    }
}
