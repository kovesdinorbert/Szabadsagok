using System.Security.Claims;

namespace Szabadsagok.Helpers
{
    public static class ClaimHelper
    {
        public static string GetClaimData(ClaimsPrincipal user, string claimType)
        {
            var claimsIdentity = user.Identity as ClaimsIdentity;
            if (claimsIdentity != null)
            {
                var someClaim = claimsIdentity.FindFirst(claimType);
                return someClaim.Value;
            }

            return string.Empty;
        }
    }
}
