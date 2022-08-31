using Core.Entities;
using FluentValidation;

namespace Core.Validation
{
    public class UserValidation : AbstractValidator<User>
    {
        public UserValidation()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Roles).NotEmpty();
        }
    }
}
