using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Szabadsagok.Helpers;

namespace Szabadsagok.Controllers
{
    public class BaseController : Controller
    {
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
