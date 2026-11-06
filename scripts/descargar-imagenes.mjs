// Descarga las imágenes de src/data/celulares.json a src/assets/images/celulares/
// y actualiza el campo "imagen" del JSON con la ruta local.
//
// Uso (desde la raíz del proyecto):  node scripts/descargar-imagenes.mjs
// Requiere Node 18 o superior (usa fetch nativo).

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'src', 'data', 'celulares.json');
const outDir = path.join(root, 'src', 'assets', 'images', 'celulares');

// Ruta que se guarda en el JSON (relativa a las páginas de src/html/, igual que el resto de assets).
const publicBase = '../assets/images/celulares';

const CDN = 'https://fdn2.gsmarena.com/vv/bigpic/';

// Slugs alternativos por id, para cuando el slug del JSON da 404.
// GSMArena a veces añade sufijos (código de modelo, "international", "new", etc.).
// Se prueban en orden hasta que uno responda con una imagen.
const candidatas = {
  1: ['samsung-galaxy-s24-ultra-5g-sm-s928', 'samsung-galaxy-s24-ultra-5g-sm-s928-stylus', 'samsung-galaxy-s24-ultra-sm-s928'],
  3: ['samsung-galaxy-s24-5g-sm-s921', 'samsung-galaxy-s24-sm-s921', 'samsung-galaxy-s24'],
  10: ['huawei-pura70-pro', 'huawei-pura-70-pro-new'],
  11: ['tecno-camon-30-pro-new', 'tecno-camon-30-pro-5g-new', 'tecno-camon-30-pro'],
  13: ['oppo-reno11-international', 'oppo-reno11-global', 'oppo-reno11'],
  14: ['oppo-a78-4g', 'oppo-a78-5g', 'oppo-a78-global'],
  15: ['infinix-note60-pro-5g', 'infinix-note-60-pro']
};

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Referer: 'https://www.gsmarena.com/'
};

const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const extensionFrom = (contentType, url) => {
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
  return path.extname(new URL(url).pathname) || '.jpg';
};

// Devuelve { buffer, contentType } o lanza un error si la URL no entrega una imagen.
async function descargar(url) {
  const response = await fetch(url, { headers });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!contentType.startsWith('image/')) throw new Error(`no es una imagen (${contentType || 'sin content-type'})`);
  return { buffer: Buffer.from(await response.arrayBuffer()), contentType };
}

const celulares = JSON.parse(await readFile(jsonPath, 'utf8'));
await mkdir(outDir, { recursive: true });

const fallidas = [];

for (const celular of celulares) {
  const nombre = `${celular.marca} ${celular.modelo}`;

  // Si ya es una ruta local, no hay nada que descargar.
  if (!/^https?:\/\//i.test(celular.imagen)) {
    console.log(`= ${nombre}: ya es local (${celular.imagen})`);
    continue;
  }

  const urls = [celular.imagen, ...(candidatas[celular.id] || []).map((slug) => `${CDN}${slug}.jpg`)];
  const errores = [];
  let guardada = false;

  for (const url of urls) {
    try {
      const { buffer, contentType } = await descargar(url);
      const fileName = `${String(celular.id).padStart(2, '0')}-${slugify(nombre)}${extensionFrom(contentType, url)}`;
      await writeFile(path.join(outDir, fileName), buffer);

      celular.imagen = `${publicBase}/${fileName}`;
      console.log(`✔ ${nombre} -> ${fileName}${url === urls[0] ? '' : `  (slug alterno: ${url})`}`);
      guardada = true;
      break;
    } catch (error) {
      errores.push(`${url} -> ${error.message}`);
    }
  }

  if (!guardada) {
    fallidas.push({ nombre, errores });
    console.warn(`✘ ${nombre}: ningún slug funcionó`);
  }
}

// Solo se modifican las entradas descargadas; las fallidas conservan su URL original.
await writeFile(jsonPath, `${JSON.stringify(celulares, null, 2)}\n`, 'utf8');

console.log(`\nDescargadas: ${celulares.length - fallidas.length}/${celulares.length}`);
if (fallidas.length) {
  console.log('\nFallaron (consigue la URL real desde la página del modelo en gsmarena.com, pégala en celulares.json y vuelve a ejecutar):');
  fallidas.forEach(({ nombre, errores }) => console.log(` - ${nombre}\n${errores.map((e) => `     ${e}`).join('\n')}`));
}
