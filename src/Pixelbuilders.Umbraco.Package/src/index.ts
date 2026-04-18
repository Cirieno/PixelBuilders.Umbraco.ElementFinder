import { type UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { client } from './api/client.gen.js';
import './element-finder';
import './element-finder-dashboard';

// load up the manifests here.
import { manifests as elementFinderManifest } from './manifests/element-finder.manifest.ts';
import { manifests as contextManifests } from './manifests/context.manifest.ts';
import { manifests as dashboardManifests } from './manifests/element-finder.dashboard.manifest.ts';

const manifests: any[] = [
    ...elementFinderManifest,
    ...contextManifests,
    ...dashboardManifests
];

export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
    _host.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
        const config = authContext?.getOpenApiConfiguration();

        client.setConfig({
            auth: config?.token ?? undefined,
            baseUrl: config?.base ?? '',
            credentials: config?.credentials ?? 'same-origin',
        });
    });

    extensionRegistry.registerMany(manifests);
};
