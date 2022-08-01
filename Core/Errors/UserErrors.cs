using ErrorOr;

namespace Core.Errors
{
    public static class UserErrors
    {
        public static Error NameAndEmailRequired => Error.Validation
            (
                code: "UserErrors.NameAndEmailRequired",
                description: "Név és email megadása kötelező!"
            );
        public static Error UserNotFound => Error.Validation
            (
                code: "UserErrors.UserNotFound",
                description: "Nincs ilyen felhasználó!"
            );
    }
}
