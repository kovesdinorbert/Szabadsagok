using ErrorOr;

namespace MinimalApi.Helpers
{
    public static class BusinessErrorHandler
    {
        public static IResult BusinessError(Error error)
        {
            var statusCode = error.Type switch
            {
                ErrorType.NotFound => Results.NotFound(error.Description),
                ErrorType.Validation => Results.BadRequest(error.Description),
                ErrorType.Conflict => Results.BadRequest(error.Description),
                ErrorType.Failure => Results.BadRequest(error.Description),
                _ => Results.BadRequest(error.Description)
            };

            return statusCode;
        }
    }
}
