using AutoMapper;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Columns;
using BenchmarkDotNet.Configs;
using BenchmarkDotNet.Jobs;
using BenchmarkDotNet.Loggers;
using BenchmarkDotNet.Running;
using BenchmarkDotNet.Validators;
using MappingBenchmark;
using Mapster;
using Mapper = MapsterMapper.Mapper;

using System;
using System.Collections.Generic;
using System.Linq;

[SimpleJob(RuntimeMoniker.Net60)]
[SimpleJob(RuntimeMoniker.Net70)]
public class Program
{
    public static void Main(string[] args)
    {
        var config = new ManualConfig()
                            .WithOptions(ConfigOptions.DisableOptimizationsValidator)
                            .AddValidator(JitOptimizationsValidator.DontFailOnError)
                            .AddLogger(ConsoleLogger.Default)
                            .AddColumnProvider(DefaultColumnProviders.Instance);
        var summary = BenchmarkRunner.Run<Functions>(config);

        Console.ReadKey();
    }
}

[SimpleJob(RuntimeMoniker.Net60)]
[SimpleJob(RuntimeMoniker.Net70)]
public class Functions
{
    private List<EventDto> dtoList { get; set;  } = new List<EventDto>();
    private TypeAdapterConfig config { get; set; } = new TypeAdapterConfig();
    private Mapper _mapper { get; set; }
    private AutoMapper.IMapper _automapper { get; set; }

    public Functions()
    {

        var dto = new EventDto()
        {
            Id = "1",
            Description = "Description",
            EndDate = DateTime.Now,
            StartDate = DateTime.Now,
            Subject = "Subject"
        };

        //for (int i = 0; i < 10; i++)
        for (int i = 0; i < 10000; i++)
        //for (int i = 0; i < 10000000; i++)
        {
            dtoList.Add(dto);
        }


        config.NewConfig<EventDto, EventModel>().TwoWays();
        _mapper = new Mapper(config);

        MapperWrapper.Initialize(x => x.AddProfile(new MappingConfig()));
        _automapper = MapperWrapper.Mapper;
    }


    [Benchmark]
    public void MapMapster()
    {
        var model = _mapper.Map<List<EventModel>>(dtoList);
    }

    [Benchmark]
    public void MapAutomapper()
    {
        var automappermodel = _automapper.Map<List<EventModel>>(dtoList);
    }

    [Benchmark]
    public void MapManualMapper()
    {
        var manulMapper = dtoList.Select(x => MapManual(x)).ToList();
    }

    EventModel MapManual(EventDto dto)
    {
        return new EventModel()
        {
            Description = dto.Description,
            EndDate = dto.EndDate,
            StartDate = dto.StartDate,
            Id = dto.Id,
            Subject = dto.Subject
        };
    }
}

public class MappingConfig : Profile
{
    public MappingConfig()
    {
        CreateMap<EventDto, EventModel>().ReverseMap();
    }
}





public static class MapperWrapper
{
    private const string InvalidOperationMessage = "Mapper not initialized. Call Initialize with appropriate configuration. If you are trying to use mapper instances through a container or otherwise, make sure you do not have any calls to the static Mapper.Map methods, and if you're using ProjectTo or UseAsDataSource extension methods, make sure you pass in the appropriate IConfigurationProvider instance.";
    private const string AlreadyInitialized = "Mapper already initialized. You must call Initialize once per application domain/process.";

    private static IConfigurationProvider _configuration;
    private static AutoMapper.IMapper _instance;

    private static IConfigurationProvider Configuration
    {
        get => _configuration ?? throw new InvalidOperationException(InvalidOperationMessage);
        set => _configuration = (_configuration == null) ? value : throw new InvalidOperationException(AlreadyInitialized);
    }

    public static AutoMapper.IMapper Mapper
    {
        get => _instance ?? throw new InvalidOperationException(InvalidOperationMessage);
        private set => _instance = value;
    }

    public static void Initialize(Action<IMapperConfigurationExpression> config)
    {
        Initialize(new MapperConfiguration(config));
    }

    public static void Initialize(MapperConfiguration config)
    {
        Configuration = config;
        Mapper = Configuration.CreateMapper();
    }

    public static void AssertConfigurationIsValid() => Configuration.AssertConfigurationIsValid();
}

