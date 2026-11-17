import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    // Point to the local file you just saved
    input: './swagger.json', 
    output: {
        path: 'src/api',
        postProcess: []
    },
    plugins: [
        '@hey-api/client-fetch'
    ],
});