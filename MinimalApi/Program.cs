var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<AppConfiguration>(builder.Configuration.GetSection("AppConfiguration"));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var appConfiguration = builder.Configuration.GetSection("AppConfiguration").Get<AppConfiguration>();
builder.Services.AddDbContext<SzabadsagAppContext>(x => x.UseSqlServer(connectionString));

builder.Services.AddDataProtection()
.UseCustomCryptographicAlgorithms(new CngCbcAuthenticatedEncryptorConfiguration
{
    EncryptionAlgorithm = "AES",
    EncryptionAlgorithmProvider = null,
    EncryptionAlgorithmKeySize = 128
});

builder.Services.RegisterAppServices();
builder.Services.AddMappings();
builder.Services.AddCors();

builder.Services.AddAuthorization(cfg => {
    cfg.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    cfg.AddPolicy(RoleConstants.ADMINPOLICY, policy => policy.RequireClaim(ClaimTypes.Role, RoleEnum.Admin.ToString()));
    cfg.AddPolicy(RoleConstants.ACCEPTERPOLICY, policy => policy.RequireClaim(ClaimTypes.Role, RoleEnum.Accepter.ToString()));
    cfg.AddPolicy(RoleConstants.COMMONPOLICY, policy => policy.RequireClaim(ClaimTypes.Role, RoleEnum.Common.ToString()));
});

builder.Services.AddAuthentication(opt => {
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appConfiguration.SecretKey)),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddEndpointDefinitions(typeof(UserEndpoints));


var app = builder.Build();

app.UseEndpointDefinitions();

app.UseMiddleware<ValidationExceptionMiddleware>();



if (app.Environment.IsDevelopment())
{
}
app.UseCors(x => x.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.Run();
