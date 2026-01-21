import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'build',
        assetsDir: 'static',
        manifest: 'asset-manifest.json',
        emptyOutDir: true,
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/ws/': {
                target: 'http://localhost:8000',
                ws: true,
                changeOrigin: true,
            },
            '/getpackage': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
});
