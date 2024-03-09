<div align='center'>
  <img width='480px' height='200px' src='./assets/mock-mirror.png'>
</div>

# Mock Mirror

Mock services behind your backend during integration tests.

## Why

When writing integration tests, there are numerous ways to mock responses from your backend. This can be done directly in your tests (for example, in **Playwright**, **Cypress**, etc.) or by using tools like **Mock Service Worker**.

But what if your backend connects to other services and you would like to test your frontend and backend together while mocking those service responses?

With **Mock Mirror** you get a tiny prgrammable server which can be fed with mocks directly within your tests.

### Example

```ts
describe('user', () => {
  it('should be able to fetch users from the user service', async ({ page }) => {
    await mockMirror(async ({ addRoutes, scope }) => {
      // Add a route to mock the user service
      await addRoutes([
        {
          pathPattern: '/api/users/*',
          response: {
            id: 777,
            username: 'johnwick',
            firstname: 'John',
            lastname: 'Wick',
          },
        },
      ]);

      // This will hit the backend, which will then connect to the mocked user service
      await page.goto('http://localhost:3000/user/detail/777');

      await expect(page.getByText('Welcome, John Wick')).toBeVisible();
    });
  });
});
```

## Development

To start the development server run:

```bash
bun run dev
```
