import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    test: {
        projects: [
            {
                plugins: [react()],
                resolve: {
                    tsconfigPaths: true
                },
                test: {
                    include: ['app/**/*.browser.test.tsx'],
                    name: 'jsdom',
                    environment: 'jsdom',
                }
            },
            {
                plugins: [react()],
                resolve: {
                    tsconfigPaths: true
                },
                test: {
                    setupFiles: ['./app/_test/setup.node.ts'],
                    include: ['app/**/*.node.test.ts'],
                    name: { label: 'node', color: 'green' },
                    environment: 'node',
                    alias: {
                        'server-only': new URL('./app/_test/server-only-stub.ts', import.meta.url).pathname,
                    },
                }
            }
        ]
    }
})