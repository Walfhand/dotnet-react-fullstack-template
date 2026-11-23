import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './specs',
    timeout: 30_000,
    expect: {
        timeout: 10_000,
    },
    reporter: [['list'], ['html', {outputFolder: 'playwright-report', open: 'never'}]],
    use: {
        baseURL: process.env.BASE_URL_CLIENT || 'http://127.0.0.1:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
});
