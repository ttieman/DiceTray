import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    plugins: [wasm(), topLevelAwait()],
    worker: {
        format: "es",
        plugins: () => [wasm()],
    },
    optimizeDeps: {
        exclude: ['@dimforg/rapier3d'],
        include: [] // Add any specific dependencies you want to pre-bundle
    },
    build: {
        target: "esnext",
        modulePreload: {
            polyfill: false,
        },
        outDir: './app/dist'
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true
        },
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    }
});