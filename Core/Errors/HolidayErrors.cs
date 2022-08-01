using ErrorOr;

namespace Core.Errors
{
    public static class HolidayErrors
    {
        public static Error FoundOpenedStatusHolidayRequest => Error.Conflict
            (
                code: "HolidayErrors.FoundOpenedStatusHolidayRequest",
                description: "Van kiírt szabadság, amit még nem bíráltak el!"
            );

        public static Error NotEnoughAvailableHolidays => Error.Failure
            (
                code: "HolidayErrors.NotEnoughAvailableHolidays",
                description: "Nincs elég elérhető szabadnap!"
            );

        public static Error HolidayAlreadyStarted => Error.Failure
            (
                code: "HolidayErrors.HolidayAlreadyStarted",
                description: "Már elkezdett szabadság nem törölhető!"
            );

        public static Error HolidayStatusIsNotRequired => Error.Failure
            (
                code: "HolidayErrors.HolidayStatusIsNotRequired",
                description: "Csak igényelt állapotú szabadságigény módosítható!"
            );
    }
}
