namespace Core.Configuration
{
    public class AppConfiguration
    {
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPassword { get; set; }
        public bool SmtpUseSsl { get; set; }

        public string SecretKey { get; set; }
        public string RedirectUri { get; set; }
        public string ClientId { get; set; }
        public string TenantId { get; set; }
        public string Authority { get; set; }
    }
}
