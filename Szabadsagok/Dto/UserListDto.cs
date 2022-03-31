using System;

namespace Szabadsagok.Dto
{
    public class UserListDto: IHasIdDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
