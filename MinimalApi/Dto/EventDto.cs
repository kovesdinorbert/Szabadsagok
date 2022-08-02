namespace SzabadsagolosMinimalApi
{
    public class EventDto : IHasIdDto
    {
        public string Id { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
