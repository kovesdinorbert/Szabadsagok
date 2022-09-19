using FluentValidation;

namespace MinimalApi.Helpers.Validation
{
    public class UserValidation : AbstractValidator<UserDataDto>
    {
        public UserValidation()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Roles).NotEmpty();
        }
    }
}
