// main.ts - Deno Deploy Static HTML Server
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const PORT = 8080;

// Security headers configuration
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'",
  "Referrer-Policy": "no-referrer",
};

// Get the absolute path to index.html
const __dirname = new URL(".", import.meta.url).pathname;
const htmlPath = `${__dirname}public/index.html`;

// Read HTML content at startup
let htmlContent: string;
try {
  htmlContent = await Deno.readTextFile(htmlPath);
  console.log("Successfully loaded index.html");
} catch (error) {
  console.error(`FATAL: Could not load index.html at ${htmlPath}`);
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
    <p>index.html not found at path: <code>${htmlPath}</code></p>
    <p>Please verify your repository contains a <code>public/index.html</code> file.</p>
    <p>Current directory structure:</p>
    <pre>${await getDirectoryStructure(__dirname)}</pre>
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
async function getDirectoryStructure(path: string): Promise<string> {
  try {
    const entries = [];
    for await (const entry of Deno.readDir(path)) {
      entries.push(entry.isDirectory ? `📁 ${entry.name}/` : `📄 ${entry.name}`);
    }
    return entries.sort().join("\n");
  } catch (error) {
    return `Error listing directory: ${error.message}`;
  }
}

// Start server
console.log(`Server started at http://localhost:${PORT}`);
console.log(`Serving from: ${htmlPath}`);
serve(handleRequest, { port: PORT });
