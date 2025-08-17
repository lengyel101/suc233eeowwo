// main.ts - Robust Static File Server for Deno Deploy
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const PORT = 8080;
const STATIC_DIR = "public";

// Security headers configuration
const SECURITY_HEADERS = new Headers({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
});

// Handle requests
async function handleRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    let filePath = url.pathname;

    // Normalize path
    if (filePath === "/") filePath = "/index.html";
    
    // Prevent path traversal attacks
    if (filePath.includes("..") || filePath.includes("//")) {
      return new Response("Invalid URL path", { status: 400, headers: SECURITY_HEADERS });
    }

    // Build full file path
    const fullPath = `${STATIC_DIR}${filePath}`;
    
    // Handle root index file
    if (fullPath.endsWith("/index.html")) {
      return serveStaticFile(fullPath);
    }

    // Handle other files
    return await serveStaticFile(fullPath);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return new Response("Internal server error", { 
      status: 500,
      headers: SECURITY_HEADERS 
    });
  }
}

// Serve static files with proper caching
async function serveStaticFile(filePath: string): Promise<Response> {
  try {
    const file = await Deno.open(filePath, { read: true });
    const fileInfo = await Deno.stat(filePath);
    const headers = new Headers(SECURITY_HEADERS);

    // Set content type
    const ext = filePath.split('.').pop() || '';
    headers.set("Content-Type", getContentType(ext));

    // Set cache headers (1 hour for assets, no cache for HTML)
    if (filePath.endsWith(".html")) {
      headers.set("Cache-Control", "no-cache, max-age=0");
    } else {
      headers.set("Cache-Control", "public, max-age=3600");
    }

    // Return file response
    return new Response(file.readable, { 
      status: 200,
      headers 
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response("Page not found", {
        status: 404,
        headers: SECURITY_HEADERS
      });
    }
    throw error;
  }
}

// Get proper content type
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "txt": "text/plain",
    "pdf": "application/pdf",
  };
  return types[ext.toLowerCase()] || "application/octet-stream";
}

// Start server
console.log(`Server started on port ${PORT}`);
serve(handleRequest, { port: PORT });
