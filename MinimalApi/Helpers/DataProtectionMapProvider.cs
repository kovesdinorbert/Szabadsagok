using Microsoft.AspNetCore.DataProtection;

namespace SzabadsagolosMinimalApi
{
    public interface IDataProtectionMapProvider
    {
        string Unprotect(object source);
        string Protect(object source);
    }
    public class DataProtectionMapProvider: IDataProtectionMapProvider
    {
        private readonly IDataProtector _protector;

        public DataProtectionMapProvider(IDataProtectionProvider provider)
        {
            _protector = provider.CreateProtector("TitkosKulcs");
        }

        public string Unprotect(object source)
        {
            return _protector.Unprotect(source.ToString());
        }
        public string Protect(object source)
        {
            return _protector.Protect(source.ToString());
        }
    }
}
