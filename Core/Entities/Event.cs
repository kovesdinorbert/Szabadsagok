using System;

namespace Core.Entities
{
    public class Event : _CrudBase
    {
        public string Subject { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
