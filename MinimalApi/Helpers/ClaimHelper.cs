using System.Security.Claims;

namespace SzabadsagolosMinimalApi
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

        public static int GetUserIdFromToken(ClaimsPrincipal user)
        {
            var idStr = GetClaimData(user, ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(idStr) || !int.TryParse(idStr, out var userId))
            {
                throw new System.Exception("Unauthorized user!");
            }

            return userId;
        }
    }
}
