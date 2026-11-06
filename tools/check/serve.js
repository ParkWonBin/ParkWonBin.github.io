// 빌드된 사이트(_site)를 GitHub Pages 와 같은 규칙으로 서빙한다 (점검용)
//   폴더 → index.html, /x → /x.html, 슬래시 없는 폴더 → 301, 없는 주소 → 404.html (상태 404)
const http = require('http');
const fs = require('fs');
const path = require('path');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.geojson': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.mp4': 'video/mp4',
};

function serve(root, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://x');
      let p;
      try { p = decodeURIComponent(u.pathname); } catch (e) { p = u.pathname; }
      const f = path.join(root, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
      const send = (file, code) => {
        res.writeHead(code, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
      };
      try {
        const st = fs.statSync(f);
        if (st.isDirectory()) {
          if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' + u.search }); return res.end(); }
          if (fs.existsSync(path.join(f, 'index.html'))) return send(path.join(f, 'index.html'), 200);
        } else return send(f, 200);
      } catch (e) { /* 없음 */ }
      if (fs.existsSync(f + '.html')) return send(f + '.html', 200);
      send(path.join(root, '404.html'), 404);
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

module.exports = { serve };
if (require.main === module) {
  const [root = '_site', port = '4321'] = process.argv.slice(2);
  serve(path.resolve(root), +port).then(() => console.log(`http://127.0.0.1:${port}/  ←  ${root}`));
}
