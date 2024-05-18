# Yar - Youtube Archive

**Yar** is a self-hosted video archival application. It uses [yt-dlp](https://github.com/yt-dlp/yt-dlp) under the hood, allowing it to archive videos from any source accessible through it.

### Development

This repository contains a [turbo repo](https://turbo.build/repo) with the following applications:

-   [`apps/backend`](./apps/backend): the backend server using express
-   [`apps/web`](./apps/web): frontend [svelte-kit](https://kit.svelte.dev/) application
-   [`packages/ui`](./packages/ui): a svelte component library shared with frontend applications
-   [`packages/types`](./packages/types): typescript definitions for backend and frontend applications
-   [`packages/utils`](./packages/utils): helper functions for backend and frontend applications
-   [`packages/database`](./packages/database): database access the backend
