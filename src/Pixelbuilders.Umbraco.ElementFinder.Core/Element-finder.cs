using Asp.Versioning;
using ElementFinder.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pixelbuilders.Umbraco.ElementFinder.Core.Models;
using System.Text.Json;
using System.Text.RegularExpressions;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace ElementFinder.Core
{
    internal static partial class ElementFinderPatterns
    {
        [GeneratedRegex("^[\\s\\r\\n]*[\\[{]", RegexOptions.Compiled)]
        public static partial Regex LooksLikeJson();
    }

    [ApiController]
    [ApiVersion("1.0")]
    [MapToApi("element-finder")]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [JsonOptionsName(Constants.JsonOptionsNames.BackOffice)]
    [BackOfficeRoute("element-finder/api/v{version:apiVersion}")]
    public class DocumentTypeUsageController : Controller
    {
        private readonly IContentService _contentService;
        private readonly IContentTypeService _contentTypeService;
        private readonly IPublishedUrlProvider _publishedUrlProvider;
        private readonly IUmbracoContextFactory _umbracoContextFactory;

        public DocumentTypeUsageController(
            IContentService contentService,
            IContentTypeService contentTypeService,
            IPublishedUrlProvider publishedUrlProvider,
            IUmbracoContextFactory umbracoContextFactory)
        {
            _contentService = contentService;
            _contentTypeService = contentTypeService;
            _publishedUrlProvider = publishedUrlProvider;
            _umbracoContextFactory = umbracoContextFactory;
        }

        [HttpGet("all-types")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(List<Elements>), 200)]
        public List<Elements> GetAllDocumentTypes()
        {
            return _contentTypeService.GetAll()
                .Select(x => new Elements
                {
                    Name = x.Name ?? string.Empty,
                    Alias = x.Alias ?? string.Empty,
                    Kind = x.IsElement ? "element" : "document",
                })
                .OrderBy(x => x.Kind)
                .ThenBy(x => x.Name)
                .ToList();
        }

        [HttpGet("usage/{alias}")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(Usage), 200)]
        public Usage GetUsage(string alias)
        {
            var contentType = _contentTypeService.Get(alias);
            if (contentType == null)
                return EmptyUsage();

            var documentTypeIds = new HashSet<int>();
            var elementKeys = new HashSet<Guid>();

            // Direct document type
            if (!contentType.IsElement)
                documentTypeIds.Add(contentType.Id);

            // Direct element type
            if (contentType.IsElement)
                elementKeys.Add(contentType.Key);

            // Composition handling
            var composedTypes = _contentTypeService
                .GetAll()
                .Where(ct => ct.ContentTypeComposition
                    .Any(c => c.Key == contentType.Key));

            foreach (var ct in composedTypes)
            {
                if (ct.IsElement)
                    elementKeys.Add(ct.Key);
                else
                    documentTypeIds.Add(ct.Id);
            }

            if (!documentTypeIds.Any() && !elementKeys.Any())
                return EmptyUsage();

            var results = new List<Details>();
            var matchedIds = new HashSet<int>();

            using var context = _umbracoContextFactory.EnsureUmbracoContext();
            var publishedCache = context.UmbracoContext.Content;

            foreach (var content in GetAllContent())
            {
                var published = publishedCache?.GetById(content.Id);
                if (published == null)
                    continue;

                bool matched = false;

                // 1️ Direct Document Type match
                if (documentTypeIds.Contains(content.ContentTypeId))
                {
                    matched = true;
                }
                // 2️ Block element match
                else if (elementKeys.Any())
                {
                    foreach (var property in content.Properties)
                    {
                        if (property.GetValue() is not string rawValue)
                            continue;

                        if (ContainsElementWithKeys(rawValue, elementKeys))
                        {
                            matched = true;
                            break;
                        }
                    }
                }

                if (!matched)
                    continue;

                if (!matchedIds.Add(content.Id))
                    continue;

                results.Add(new Details
                {
                    PageName = published.Name,
                    Url = _publishedUrlProvider.GetUrl(published),
                    Id = published.Key.ToString()
                });
            }

            return new Usage
            {
                Usages = results
            };
        }

        // =====================================================
        // JSON BLOCK SCANNING
        // =====================================================

        private static bool ContainsElementWithKeys(string rawValue, HashSet<Guid> elementKeys)
        {
            if (string.IsNullOrWhiteSpace(rawValue))
                return false;

            // Rich text blocks and some editors persist references directly in markup/JSON.
            // A raw GUID match is cheap and catches formats outside block-editor payloads.
            if (ContainsRawKeyReference(rawValue, elementKeys))
                return true;

            if (!ElementFinderPatterns.LooksLikeJson().IsMatch(rawValue))
                return false;

            try
            {
                using var doc = JsonDocument.Parse(rawValue);
                return ContainsElementWithKeys(doc.RootElement, elementKeys);
            }
            catch (JsonException)
            {
                return false;
            }
        }

        private static bool ContainsElementWithKeys(JsonElement element, HashSet<Guid> elementKeys)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    if (element.TryGetProperty("contentTypeKey", out var keyProp) &&
                        keyProp.TryGetGuid(out var blockKey) &&
                        elementKeys.Contains(blockKey))
                    {
                        return true;
                    }

                    foreach (var property in element.EnumerateObject())
                    {
                        if (ContainsElementWithKeys(property.Value, elementKeys))
                            return true;
                    }

                    return false;

                case JsonValueKind.Array:
                    foreach (var item in element.EnumerateArray())
                    {
                        if (ContainsElementWithKeys(item, elementKeys))
                            return true;
                    }

                    return false;

                case JsonValueKind.String:
                    var stringValue = element.GetString();
                    return stringValue is not null && ContainsRawKeyReference(stringValue, elementKeys);

                default:
                    return false;
            }
        }

        private static bool ContainsRawKeyReference(string rawValue, HashSet<Guid> elementKeys)
            => elementKeys.Any(key =>
                rawValue.Contains(key.ToString("D"), StringComparison.OrdinalIgnoreCase) ||
                rawValue.Contains(key.ToString("N"), StringComparison.OrdinalIgnoreCase));

        // =====================================================
        // CONTENT PAGING HELPERS
        // =====================================================

        private IEnumerable<IContent> GetAllContent()
        {
            var pageIndex = 0;
            const int pageSize = 500;
            var results = new List<IContent>();

            do
            {
                var page = _contentService.GetPagedDescendants(
                    -1,
                    pageIndex,
                    pageSize,
                    out long total);

                results.AddRange(page);
                pageIndex++;

                if (results.Count >= total)
                    break;

            } while (true);

            return results;
        }

        private static Usage EmptyUsage()
            => new Usage { Usages = Enumerable.Empty<Details>() };
    }
}
