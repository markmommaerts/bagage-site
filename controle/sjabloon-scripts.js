/* Haalt de scripts uit de sjablonen, zodat ook die op fouten worden nagekeken. */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'templates'), uit = path.join(__dirname, 'tmp');
fs.mkdirSync(uit, { recursive: true });
fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const delen = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  delen.forEach((js, i) => fs.writeFileSync(path.join(uit, `${f}.${i + 1}.js`), js));
});
