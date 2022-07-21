using Core.Configuration;
using Core.Entities;
using Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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
        public virtual DbSet<Event> Events { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Holiday>()
                .HasOne(bc => bc.User)
                .WithMany(b => b.Holidays)
                .HasForeignKey(bc => bc.UserId);
            modelBuilder.Entity<HolidayConfig>()
                .HasOne(bc => bc.User)
                .WithMany(b => b.HolidayConfigs)
                .HasForeignKey(bc => bc.UserId);

            modelBuilder.Entity<Holiday>().ToTable("Holidays").HasIndex(h => h.Year);
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<HolidayConfig>().ToTable("HolidayConfigs");
            modelBuilder.Entity<YearConfig>().ToTable("YearConfigs");
            modelBuilder.Entity<Event>().ToTable("Events");


            modelBuilder.Entity<Holiday>().Property(p => p.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<HolidayConfig>().Property(p => p.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<User>().Property(p => p.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<YearConfig>().Property(p => p.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<Event>().Property(p => p.Id).ValueGeneratedOnAdd();

            var jsonConverter = new EnumCollectionJsonValueConverter<RoleEnum>();
            var comparer = new CollectionValueComparer<RoleEnum>();

            modelBuilder.Entity<User>()
                .Property(e => e.Roles)
                .HasConversion(jsonConverter)
                .Metadata.SetValueComparer(comparer);

            modelBuilder.Entity<YearConfig>().HasIndex(p => p.Year);
            modelBuilder.Entity<YearConfig>().HasIndex(p => p.Date);
            modelBuilder.Entity<Event>().HasIndex(p => p.StartDate);
            modelBuilder.Entity<Holiday>().HasIndex(p => p.UserId);
            modelBuilder.Entity<Holiday>().HasIndex(p => p.Start);
            modelBuilder.Entity<HolidayConfig>().HasIndex(p => p.UserId);
            modelBuilder.Entity<User>().HasIndex(p => p.Email);
        }
    }
}
