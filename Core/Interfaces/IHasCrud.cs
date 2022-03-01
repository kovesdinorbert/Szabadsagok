using System;

namespace Core.Interfaces
{
    public interface IHasCrud
    {
        DateTime Created { get; set; }
        Guid CreatedBy { get; set; }
        DateTime? Modified { get; set; }
        Guid? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
