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
        exclude: ['@dimforg/rapier3d']
    },
    build: {
        target: "esnext",
        modulePreload: {
            polyfill: false,
        },
    },
    server: {
        header: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    }
});