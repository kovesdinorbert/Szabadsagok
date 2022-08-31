using Core.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Data.Sql;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Data
{
    public class DapperContext
    {
        public class DbConnector
        {
            private readonly DbConfiguration _configuration;

            protected DbConnector(IOptions<DbConfiguration> dbConfiguration)
            {
                _configuration = dbConfiguration.Value;
            }

            public IDbConnection CreateConnection()
            {
                string _connectionString = _configuration.DbConnection;
                return new SqlConnection(_connectionString);
            }
        }
    }
}
