using Core.Enums;
using Core.Interfaces;
using System;
using System.Collections.Generic;

namespace Core.Entities
{
    public class User: IHasId
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool Deleted { get; set; }
        public RoleEnum Role { get; set; }
        public List<Holiday> Holidays { get; set; } = new List<Holiday>();
    }
}
