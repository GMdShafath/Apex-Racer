// Builds www/ for Capacitor: wraps game.html in a full HTML document and,
// when three is installed, vendors it locally so the APK runs offline.
// Usage: node scripts/build.mjs [--cdn]
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');
const threeDir = join(root, 'node_modules', 'three');
const useCdn = process.argv.includes('--cdn') || !existsSync(threeDir);

let game = readFileSync(join(root, 'game.html'), 'utf8');

if (!useCdn) {
  const lib = join(www, 'lib', 'three');
  rmSync(join(www, 'lib'), { recursive: true, force: true });
  mkdirSync(join(lib, 'build'), { recursive: true });
  cpSync(join(threeDir, 'build', 'three.module.js'), join(lib, 'build', 'three.module.js'));
  for (const d of ['postprocessing', 'shaders', 'objects', 'utils']) {
    cpSync(join(threeDir, 'examples', 'jsm', d), join(lib, 'examples', 'jsm', d), { recursive: true });
  }
  game = game
    .replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', './lib/three/build/three.module.js')
    .replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/', './lib/three/examples/jsm/');
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0b0e13">
<meta name="mobile-web-app-capable" content="yes">
<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
${game}
</body>
</html>
`;
mkdirSync(www, { recursive: true });
writeFileSync(join(www, 'index.html'), html);
console.log(`www/index.html written (${useCdn ? 'three.js from CDN' : 'three.js bundled locally'})`);
