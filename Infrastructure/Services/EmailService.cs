using Core.Configuration;
using Core.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly AppConfiguration _appConfiguration;

        public EmailService(IOptions<AppConfiguration> appConfiguration)
        {
            _appConfiguration = appConfiguration.Value;
        }

        public Task SendEmail(string body, string subject, string from, string to)
        {
            MailMessage mailMessage = new MailMessage
            {
                Body = body,
                From = new MailAddress(from),
                Subject = subject,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            string smtpHost = _appConfiguration.SmtpHost;
            string smtpUser = _appConfiguration.SmtpUser;
            string smtpPassword = _appConfiguration.SmtpPassword;
            int smtpPort = _appConfiguration.SmtpPort;
            bool smtpUseSsl = _appConfiguration.SmtpUseSsl;

            if (!string.IsNullOrEmpty(smtpHost))
            {
                try
                {
                    SmtpClient client = new SmtpClient(smtpHost, smtpPort)
                    {
                        EnableSsl = smtpUseSsl
                    };

                    if (!string.IsNullOrEmpty(smtpUser) && !string.IsNullOrEmpty(smtpPassword))
                    {
                        client.Credentials = new NetworkCredential(smtpUser, smtpPassword);
                    }
                    else
                    {
                        client.Credentials = CredentialCache.DefaultNetworkCredentials;
                    }

                    client.Send(mailMessage);
                }
                catch (Exception ex)
                {
                }
            }

            return Task.CompletedTask;
        }
    }
}
