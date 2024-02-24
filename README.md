# Yar - Youtube Archive

**Yar** is a self-hosted video archival application. It uses [yt-dlp](https://github.com/yt-dlp/yt-dlp) under the hood, allowing it to archive videos from any source accessible through it.

### Development

This repository contains a [Turbo Repo](https://turbo.build/repo) with the following applications:

-   [`backend`](./apps/backend): the backend server using express
-   [`web`](./apps/web): frontend [svelte-kit](https://kit.svelte.dev/) application
-   [`ui`](./packages/ui): a svelte component library shared with frontend applications
