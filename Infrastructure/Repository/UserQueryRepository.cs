using Core.Configuration;
using Core.Enums;
using Core.Interfaces;
using Dapper;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Infrastructure.Data.DapperContext;

namespace Infrastructure.Repository
{
    public class UserQueryRepository<User> : DbConnector, IGenericQueryRepository<User>
    {
        public UserQueryRepository(IOptions<DbConfiguration> dbConfiguration) : base(dbConfiguration)
        {
        }

        public async Task<List<User>> FindAllAsync(string where)
        {
            try
            {
                var query = "SELECT * FROM Users";

                using (var connection = CreateConnection())
                {
                    //return (await connection.QueryAsync<User>(query)).ToList();
                    var list = connection.Query<dynamic>(query)
                            .Select(x => new Core.Entities.User()
                            {
                                Email = x.Email,
                                Deleted = x.Deleted,
                                HolidayConfigs = x.HolidayConfigs,
                                Holidays = x.Holidays,
                                Id = x.Id,
                                Name = x.Name,
                                Roles = new List<RoleEnum>()
                            }).ToList();
                    return list as List<User>;
                }
            }
            catch (Exception exp)
            {
                throw new Exception(exp.Message, exp);
            }
        }

        public async Task<User> FindByIdAsync(int id)
        {
            try
            {
                var query = "SELECT * FROM Users WHERE Id = @Id";
                var parameters = new DynamicParameters();
                parameters.Add("Id", id, DbType.Int32);

                using (var connection = CreateConnection())
                {
                    return (await connection.QueryFirstOrDefaultAsync<User>(query, parameters));
                }
            }
            catch (Exception exp)
            {
                throw new Exception(exp.Message, exp);
            }
        }
    }
}
