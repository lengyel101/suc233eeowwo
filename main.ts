// main.ts - Static HTML Server for Root Directory
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const PORT = 8080;

// Security headers configuration
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'",
  "Referrer-Policy": "no-referrer",
};

// Read HTML content at startup
let htmlContent: string;
try {
  // Use direct path since index.html is in root
  htmlContent = await Deno.readTextFile("index.html");
  console.log("Successfully loaded index.html");
} catch (error) {
  console.error(`FATAL: Could not load index.html`);
  console.error(`Error details: ${error.message}`);
  htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Configuration Error</title>
    <style>
      body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; }
      code { background: #f0f0f0; padding: 0.25rem; }
    </style>
  </head>
  <body>
    <h1>Server Configuration Error</h1>
    <p>index.html not found in root directory</p>
    <p>Please verify your repository contains an <code>index.html</code> file in the main directory.</p>
    <p>Current directory structure:</p>
    <pre>${await getDirectoryStructure()}</pre>
  </body>
  </html>
  `;
}

// Handle all requests
function handleRequest(request: Request): Response {
  return new Response(htmlContent, {
    status: 200,
    headers: new Headers({
      "Content-Type": "text/html",
      ...SECURITY_HEADERS,
    }),
  });
}

// Helper to get directory structure
async function getDirectoryStructure(): Promise<string> {
  try {
    const entries = [];
    for await (const entry of Deno.readDir(".")) {
      entries.push(entry.isDirectory ? `📁 ${entry.name}/` : `📄 ${entry.name}`);
    }
    return entries.sort().join("\n");
  } catch (error) {
    return `Error listing directory: ${error.message}`;
  }
}

// Start server
console.log(`Server started at http://localhost:${PORT}`);
serve(handleRequest, { port: PORT });
