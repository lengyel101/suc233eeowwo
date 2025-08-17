// main.ts
import { serve } from "https://deno.land/std@0.188.0/http/file_server.ts";

const STATIC_DIR = "./public";

async function handleRequest(req: Request) {
  const pathname = new URL(req.url).pathname;
  const filePath = pathname === "/" 
    ? `${STATIC_DIR}/index.html`
    : `${STATIC_DIR}${pathname}`;

  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, {
      headers: { 
        "content-type": getContentType(filePath),
        "cache-control": "public, max-age=3600" 
      }
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

function getContentType(path: string) {
  const extension = path.split(".").pop() || "";
  const types: Record<string, string> = {
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "svg": "image/svg+xml"
  };
  return types[extension] || "text/plain";
}

// Start server
serve(handleRequest, { port: 8080 });
