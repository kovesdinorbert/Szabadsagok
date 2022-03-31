using System;

namespace Core.Interfaces
{
    public interface IHasCrud
    {
        DateTime Created { get; set; }
        int CreatedBy { get; set; }
        DateTime? Modified { get; set; }
        int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
