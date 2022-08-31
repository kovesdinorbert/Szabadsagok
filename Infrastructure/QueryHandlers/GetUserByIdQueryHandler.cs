using Core.Entities;
using Core.Interfaces;
using Core.Queries;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.QueryHandlers
{
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, User>
    {
        private readonly IGenericQueryRepository<User> _userQueryRepository;

        public GetUserByIdQueryHandler(IGenericQueryRepository<User> userQueryRepository)
        {
            _userQueryRepository = userQueryRepository;
        }

        public async Task<User> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            return await _userQueryRepository.FindByIdAsync(request.Id);
        }
    }
}
