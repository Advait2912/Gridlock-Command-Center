import fs from 'fs';
import path from 'path';

const ENV_PATH = path.resolve('.env');
let apiBase = process.env.VITE_API_BASE_URL;

// Read local .env if it exists
if (!apiBase && fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/^VITE_API_BASE_URL=["']?(.*?)["']?$/m);
  if (match) {
    apiBase = match[1].trim();
  }
}

// Generate vercel.json
const config = {
  rewrites: []
};

if (apiBase && apiBase.startsWith('http')) {
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  config.rewrites.push({
    source: "/api/:path*",
    destination: `${base}/:path*`
  });
  console.log(`✅ [Vercel Config] Added API proxy: /api/* -> ${base}/*`);
}

// ALWAYS add SPA fallback at the end
config.rewrites.push({
  source: "/(.*)",
  destination: "/index.html"
});

fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2));
console.log('✅ [Vercel Config] Generated vercel.json successfully.');

// CRITICAL STEP FOR JIO DNS BYPASS:
// We MUST force the React frontend to fetch `/api` instead of the raw Railway URL.
// If the React app fetches the Railway URL directly, the user's browser (Jio) does the DNS lookup and fails.
// If the React app fetches `/api`, it hits Vercel, and Vercel's servers do the DNS lookup and proxy it to Railway.
if (fs.existsSync(ENV_PATH)) {
  let envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  // We rewrite the .env so that Vite bundles `/api` into the frontend build.
  envContent = envContent.replace(/^VITE_API_BASE_URL=.*$/m, 'VITE_API_BASE_URL=/api');
  fs.writeFileSync(ENV_PATH, envContent);
  console.log('✅ [Vercel Config] Overwrote .env to enforce VITE_API_BASE_URL=/api for the Vite build.');
}
