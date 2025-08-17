// main.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.192.0/http/file_server.ts";

const port = 8080;

serve(async (req) => {
  const url = new URL(req.url);
  
  // Serve static files
  const response = await serveDir(req, {
    fsRoot: "public",
    showDirListing: false,
    showDotfiles: false,
    quiet: true
  });
  
  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  
  return response;
}, { port });
