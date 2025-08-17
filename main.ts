// main.ts - Minimal Static Server for Single HTML Page
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const PORT = 8080;

// Cache the HTML file in memory for faster serving
const htmlContent = await Deno.readTextFile("public/index.html");

// Security headers configuration
const SECURITY_HEADERS = new Headers({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'",
  "Referrer-Policy": "no-referrer",
});

// Handle all requests
function handleRequest(request: Request): Response {
  try {
    const url = new URL(request.url);
    
    // Serve index.html for all paths
    return new Response(htmlContent, {
      status: 200,
      headers: new Headers({
        "Content-Type": "text/html",
        ...Object.fromEntries(SECURITY_HEADERS),
      }),
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return new Response("Internal server error", { 
      status: 500,
      headers: SECURITY_HEADERS 
    });
  }
}

// Start server
console.log(`Static HTML server running on port ${PORT}`);
serve(handleRequest, { port: PORT });
