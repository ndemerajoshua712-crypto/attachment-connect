# Public test deployment

This repository deploys as two services: the React client on Vercel and the Express API plus PostgreSQL on Render. The root `vercel.json` configures the client build; `render.yaml` describes the API and test database.

## GitHub and Vercel

1. Push this repository to a GitHub repository.
2. Import it into Vercel with the repository root as the project root.
3. Set `VITE_API_URL` to `https://<Render API host>/api` in the Vercel project environment variables.
4. Deploy and note the public Vercel origin.

## Render API

1. Create a Blueprint from the GitHub repository and use `render.yaml`.
2. Set the API service's `CLIENT_URL` to the Vercel origin. Multiple origins can be comma-separated.
3. Deploy the Blueprint. Render applies the Prisma migrations during the API build.
4. Check `https://<Render API host>/api/health`, then redeploy the Vercel project if its API URL changed.

## Test deployment storage note

This free test configuration uses Render's free Postgres and a free web service. Uploaded CVs, profile photos, and company logos currently use the API server's local filesystem, so those files can disappear when the free service restarts or redeploys. The free Render database also has a limited lifetime. Use persistent object storage and a durable database before relying on this deployment for ongoing use.
