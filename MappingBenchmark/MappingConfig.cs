
using Mapster;

namespace MappingBenchmark
{
    public class MappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<EventDto, EventModel>().TwoWays();
        }
    }
}
