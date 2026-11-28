const ARTWORK_FILES = new Set([
  "cartoon-bethany.png",
  "cartoon-evan.png",
  "cartoon-auggie.png",
  "cartoon-rucca.png"
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/artwork\/characters\/([^/]+)$/);

    if (match && ARTWORK_FILES.has(match[1])) {
      const upstream = await fetch(
        "https://raw.githubusercontent.com/BethanyDoesThings/bethany-does-things/homepage-development/assets/images/characters/" +
        encodeURIComponent(match[1]),
        { cf: { cacheTtl: 86400, cacheEverything: true } }
      );
      if (!upstream.ok) return new Response("Artwork not found", { status: 404 });
      const headers = new Headers(upstream.headers);
      headers.set("Content-Type", "image/png");
      headers.set("Cache-Control", "public, max-age=86400");
      return new Response(upstream.body, { status: 200, headers });
    }

    return env.ASSETS.fetch(request);
  }
};