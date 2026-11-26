# Cloudflare Preview Environment

## Environment separation

- `main` is the production branch and serves the public website.
- `homepage-development` is a development branch and must be tested through a Cloudflare Worker Preview.
- The development preview hostname is intended to be `preview.bethanydoesthings.com`.

## Cloudflare routing requirement

The `preview.bethanydoesthings.com` hostname must be configured as a Preview custom domain, not as a Production route. Production routes and custom domains target the production deployment; Preview traffic must use a Preview URL or a custom domain explicitly enabled for Preview traffic.

In the Cloudflare dashboard, configure the hostname under the Worker's Preview environment and select Preview traffic. Keep `www.bethanydoesthings.com` assigned to Production.

## Build workflow

- Production branch: `npx wrangler deploy`
- Preview branches: `npx wrangler preview`

After pushing changes to `homepage-development`, verify that Cloudflare creates or updates its Preview and that the Preview URL serves the latest development branch without changing the active production deployment.
