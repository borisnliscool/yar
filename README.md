# Yar - Youtube Archive

**Yar** is a self-hosted video archival application. It uses [yt-dlp](https://github.com/yt-dlp/yt-dlp) under the hood, allowing it to archive videos from any source accessible through it.

### Development

This repository contains a [turbo repo](https://turbo.build/repo) with the following applications:

-   [`apps/backend`](./apps/backend): the backend server using express
-   [`apps/web`](./apps/web): frontend [svelte-kit](https://kit.svelte.dev/) application
-   [`packages/ui`](./packages/ui): a svelte component library shared with frontend applications
-   [`packages/types`](./packages/types): typescript definitions for backend and frontend applications
-   [`packages/utils`](./packages/utils): helper functions for backend and frontend applications
-   [`packages/database`](./packages/database): database access for the backend

#### Requirements

-   [docker](https://www.docker.com/)
-   [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

#### Setup

1. Start the development database

    - ```bash
      docker compose -f dev-docker-compose.yml up -d
      ```

2. Install dependencies

    - ```bash
        pnpm install
      ```

3. Generate and push the database

    - ```bash
      pnpm db:generate && pnpm db:push
      ```

4. Start the development server

    - ```bash
      pnpm dev
      ```
