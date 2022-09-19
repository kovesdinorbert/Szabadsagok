using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace MinimalApi.Helpers
{
    public class ValidationFilter<T> : IEndpointFilter where T : class
    {
        private readonly IValidator<T> _validator;

        public ValidationFilter(IValidator<T> validator)
        {
            _validator = validator;
        }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var element = context.GetArgument<T>(0);

            if (element == null)
            {
                return Results.BadRequest();
            }

            var validation = await _validator.ValidateAsync(element as T);
            if (!validation.IsValid)
            {
                return Results.BadRequest(string.Join(Environment.NewLine, validation.Errors.Select(e => e.ErrorMessage)));
            }

            var result = await next(context);
            return result;
        }
    }
}
