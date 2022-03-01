using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IEmailService
    {
        Task SendEmail(string body, string subject, string from, string to);
    }
}
