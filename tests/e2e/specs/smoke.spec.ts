import {expect, test} from '@playwright/test';

test('api openapi endpoint is reachable', async ({request}) => {
    const apiBaseUrl = process.env.BASE_URL_API || 'http://127.0.0.1:8080';
    const response = await request.get(`${apiBaseUrl}/openapi/v1.json`);

    expect(response.ok()).toBeTruthy();
    const document = await response.json();
    const responses = document.paths['/api/v1/orders'].post.responses;
    expect(responses['201']).toBeDefined();
    expect(responses['400'].content['application/json'].schema.anyOf).toEqual(
        expect.arrayContaining([
            {$ref: '#/components/schemas/MissingOrderLines'},
            {$ref: '#/components/schemas/MissingOrderLine'},
        ]),
    );
    expect(responses['422'].content['application/json'].schema.anyOf).toEqual(
        expect.arrayContaining([
            {$ref: '#/components/schemas/InvalidProductId'},
            {$ref: '#/components/schemas/InvalidQuantity'},
            {$ref: '#/components/schemas/QuantityOverflow'},
        ]),
    );
});

test('creates an order through the API', async ({request}) => {
    const apiBaseUrl = process.env.BASE_URL_API || 'http://127.0.0.1:8080';
    const response = await request.post(`${apiBaseUrl}/api/v1/orders`, {
        data: {orderLines: [{productId: 7, quantity: 3}]},
    });

    expect(response.status()).toBe(201);
    const order = await response.json();
    expect(order.orderId).toMatch(/^[0-9a-f-]{36}$/i);
});

const rejectedOrders = [
    {data: {}, status: 400, error: {code: 'orders.missing_order_lines'}},
    {data: {orderLines: [null]}, status: 400, error: {code: 'orders.missing_order_line', index: 0}},
    {
        data: {orderLines: [{productId: -1, quantity: 3}]},
        status: 422,
        error: {code: 'orders.invalid_product_id', productId: -1},
    },
    {
        data: {orderLines: [{productId: 7, quantity: 3}, {productId: 7, quantity: 0}]},
        status: 422,
        error: {code: 'orders.invalid_quantity', productId: 7, quantity: 0},
    },
    {
        data: {orderLines: [{productId: 7, quantity: 2147483647}, {productId: 7, quantity: 1}]},
        status: 422,
        error: {code: 'orders.quantity_overflow', productId: 7, currentQuantity: 2147483647, additionalQuantity: 1},
    },
];

for (const {data, status, error} of rejectedOrders) {
    test(`returns ${status} for ${error.code}`, async ({request}) => {
        const apiBaseUrl = process.env.BASE_URL_API || 'http://127.0.0.1:8080';
        const response = await request.post(`${apiBaseUrl}/api/v1/orders`, {data});

        expect(response.status()).toBe(status);
        expect(await response.json()).toEqual(error);
    });
}

test('frontend shell is reachable', async ({page}) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', {name: 'Welcome to Your App'})).toBeVisible();

    const apiBaseUrl = process.env.BASE_URL_API || 'http://127.0.0.1:8080';
    const apiStatus = await page.evaluate(async (url) => (await fetch(`${url}/alive`)).status, apiBaseUrl);
    expect(apiStatus).toBe(200);
});
