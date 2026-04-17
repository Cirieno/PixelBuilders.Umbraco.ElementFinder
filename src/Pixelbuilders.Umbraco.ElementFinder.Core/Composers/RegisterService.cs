using ElementFinder.Core.Swagger;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace ElementFinder.Core.Composers
{
    public class RegisterService : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddControllers().AddApplicationPart(typeof(DocumentTypeUsageController).Assembly);
            builder.Services.ConfigureOptions<ConfigureSwaggerGenOptions>();
        }
    }
}
