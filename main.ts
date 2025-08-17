// main.ts - Deno Static File Server
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { contentType } from "https://deno.land/std@0.192.0/media_types/content_type.ts";

const PORT = 8080;
const STATIC_DIR = "public";
const INDEX_FILE = "index.html";

// Handle incoming requests
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let filePath = url.pathname;

  try {
    // Redirect root to index.html
    if (filePath === "/") {
      filePath = `/${INDEX_FILE}`;
    }

    // Security: Prevent path traversal attacks
    if (filePath.includes("..")) {
      return new Response("Invalid path", { status: 400 });
    }

    // Build full filesystem path
    const fullPath = `${STATIC_DIR}${filePath}`;
    
    // Open and read file
    const file = await Deno.open(fullPath, { read: true });
    const fileInfo = await file.stat();
    
    // Handle directories
    if (fileInfo.isDirectory) {
      file.close();
      return new Response("Directory access not allowed", { status: 403 });
    }

    // Set content type based on file extension
    const ext = fullPath.split('.').pop() || '';
    const headers = new Headers();
    headers.set("content-type", contentType(ext) || "text/plain");
    
    // Security headers
    headers.set("x-content-type-options", "nosniff");
    headers.set("x-frame-options", "DENY");
    headers.set("content-security-policy", "default-src 'self'");
    
    // Return file stream
    return new Response(file.readable, { headers });

  } catch (error) {
    // Handle common errors
    if (error instanceof Deno.errors.NotFound) {
      return new Response("File not found", { status: 404 });
    }
    
    console.error(`Error: ${error.message}`);
    return new Response("Internal server error", { status: 500 });
  }
}

// Start server
console.log(`Server running at http://localhost:${PORT}`);
serve(handleRequest, { port: PORT });
