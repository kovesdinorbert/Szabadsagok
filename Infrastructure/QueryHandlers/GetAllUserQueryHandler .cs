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
    public class GetAllUserQueryHandler : IRequestHandler<GetAllUserQuery, List<User>>
    {
        private readonly IGenericQueryRepository<User> _userQueryRepository;

        public GetAllUserQueryHandler(IGenericQueryRepository<User> userQueryRepository)
        {
            _userQueryRepository = userQueryRepository;
        }

        public async Task<List<User>> Handle(GetAllUserQuery request, CancellationToken cancellationToken)
        {
            return await _userQueryRepository.FindAllAsync("");
        }
    }
}
