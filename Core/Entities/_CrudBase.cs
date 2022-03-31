using Core.Interfaces;
using System;

namespace Core.Entities
{
    public abstract class _CrudBase : IHasId, IHasCrud
    {
        public int Id { get; set; }

        public DateTime Created { get; set; }
        public int CreatedBy { get; set; }

        public DateTime? Modified { get; set; }
        public int? ModifiedBy { get; set; }

        public bool IsActive { get; set; }
    }
}
