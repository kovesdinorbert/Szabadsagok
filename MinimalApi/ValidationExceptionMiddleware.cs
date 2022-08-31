﻿using FluentValidation;
using MinimalApi.Dto;

namespace SzabadsagolosMinimalApi
{
    public class ValidationExceptionMiddleware
    {
        private readonly RequestDelegate _request;

        public ValidationExceptionMiddleware(RequestDelegate request)
        {
            _request = request;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _request(context);
            }
            catch (ValidationException exception)
            {
                context.Response.StatusCode = 400;
                var messages = exception.Errors.Select(x => x.ErrorMessage).ToList();
                var validationFailureResponse = new ErrorDto
                {
                    Errors = messages
                };
                await context.Response.WriteAsJsonAsync(validationFailureResponse);
            }
        }
    }
}