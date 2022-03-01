using Core.Configuration;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class SzabadsagAppContext : DbContext
    {
        private readonly DbConfiguration _dbConfiguration;

        public SzabadsagAppContext(DbContextOptions<SzabadsagAppContext> options,
                                   IOptions<DbConfiguration> dbConfiguration) : base(options)
        {
        }

        public virtual DbSet<Holiday> Holidays { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<HolidayConfig> HolidayConfigs { get; set; }
        public virtual DbSet<YearConfig> YearConfigs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Holiday>()
                .HasOne(bc => bc.User)
                .WithMany(b => b.Holidays)
                .HasForeignKey(bc => bc.UserId);

            modelBuilder.Entity<Holiday>().ToTable("Holidays").HasIndex(h => h.Year);
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<HolidayConfig>().ToTable("HolidayConfigs");
            modelBuilder.Entity<YearConfig>().ToTable("YearConfigs");
        }
    }
}
