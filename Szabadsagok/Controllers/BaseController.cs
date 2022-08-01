using ErrorOr;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Szabadsagok.Helpers;

namespace Szabadsagok.Controllers
{
    public class BaseController : Controller
    {
        protected IActionResult BusinessError(Error error)
        {
            var statusCode = error.Type switch
            {
                ErrorType.NotFound => StatusCodes.Status404NotFound,
                ErrorType.Validation => StatusCodes.Status400BadRequest,
                ErrorType.Conflict => StatusCodes.Status403Forbidden,
                ErrorType.Failure => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status500InternalServerError
            };

            return StatusCode(statusCode, error.Description);
        }

        internal int GetUserIdFromToken()
        {
            var idStr = ClaimHelper.GetClaimData(User, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !int.TryParse(idStr, out var userId))
            {
                throw new System.Exception("Unauthorized user!");
            }

            return userId;
        }
    }
}
