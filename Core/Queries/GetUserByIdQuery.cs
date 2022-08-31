using Core.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Queries
{
    public class GetUserByIdQuery : IRequest<User>
    {
        public int Id { get; private set; }

        public GetUserByIdQuery(int id)
        {
            this.Id = id;
        }
    }
}
