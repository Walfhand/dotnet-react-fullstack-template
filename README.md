# .NET + React Full-Stack Template

Run a .NET 11 modular monolith, a React 19 frontend, and PostgreSQL with Docker Compose. The parent repository pins the backend and frontend as Git submodules.

| Path | Repository |
| --- | --- |
| `src/backend` | [.NET Modular Monolith Template](https://github.com/Walfhand/dotnet-modular-monolith-template) |
| `src/client` | [React Vite Frontend Template](https://github.com/Walfhand/react-vite-frontend-template) |

## Start the stack

Choose **Use this template** on GitHub and clone your new repository. From its root, use Docker Compose 2.20 or later and Make.

```sh
git submodule update --init --recursive
cp .env.example .env
make up-all
```

- Open the [frontend](http://127.0.0.1:3000).
- Explore the API at [Scalar](http://127.0.0.1:8080/scalar).
- Use `make down` to stop the stack and keep the PostgreSQL volume.

Set `API_PORT` and `CLIENT_PORT` in `.env` to change the host ports. Compose includes the backend's API and PostgreSQL services and starts the frontend alongside them.

## Customize the submodules

Create a repository from each child template when you want to edit its code independently. Update the corresponding URLs in `.gitmodules`, initialize or sync the submodules, and commit the child revisions in the parent.

## Test the stack

With Node.js 24 and Docker, run `make e2e-local-all`. Playwright checks the API contract, order creation, typed error responses, and browser access to the API. The GitHub Actions workflow also runs the backend's architecture and PostgreSQL integration tests.
