// =================================================================
// ARCHIVO: src/js/Administrador/productos.js
// Fuente única de productos: la usan el admin y el catálogo.
// 1ª vez: carga celulares.json y lo copia a localStorage.
// Después: lee y escribe siempre en localStorage.
// =================================================================

const KEY = 'tcno_productos';

// Ruta del JSON relativa a ESTE archivo (src/js/Administrador/ -> src/data/)
const JSON_URL = new URL('../../data/celulares.json', import.meta.url);

// Opciones de producto: ÚNICO lugar donde se definen.
// Las usan el formulario del admin (listas desplegables y casillas de color)
// y los filtros del catálogo (marcas, almacenamiento y bolitas de color).
// Para agregar una marca, capacidad, etiqueta o color nuevo, basta con sumarlo aquí.
export const OPCIONES = {
  marcas: ['Samsung', 'Apple', 'Xiaomi', 'Motorola', 'Huawei', 'Tecno', 'Oppo', 'Infinix', 'Nubia'],
  almacenamientos: [64, 128, 256, 512], // en GB
  etiquetas: ['Nuevo', 'En oferta'],
  colores: { // nombre -> código (neutros suaves como los del catálogo y tonos de color más vivos)
    Negro: '#2B3440',
    Grafito: '#4A5967',
    Gris: '#79818A',
    Plata: '#D3D8DD',
    Blanco: '#E5E9EC',
    Celeste: '#8DBDE8',
    Azul: '#4F83E8',
    Verde: '#4CB782',
    Morado: '#8965E8',
    Rosado: '#EE82AE',
    Dorado: '#E8B84A',
    Rojo: '#E5484D'
  }
};

// Completa los campos que el JSON no trae
function normalizar(p) {
  return {
    ...p,
    categoria: p.categoria ?? 'Celulares',
    stock: p.stock ?? 10,
    activo: p.activo ?? true,
    colores: p.colores ?? [],
    imagenesPorColor: p.imagenesPorColor ?? {}
  };
}

export async function cargarProductos() {
  const resp = await fetch(JSON_URL);
  const baseJson = (await resp.json()).map(normalizar);
  const basePorId = new Map(baseJson.map((item) => [item.id, item]));

  try {
    const guardado = localStorage.getItem(KEY);
    if (guardado) {
      const listaGuardada = JSON.parse(guardado).map((item) => {
        const base = basePorId.get(item.id);
        const esInfinixAntiguo = item.id === 15 && item.modelo === 'Note 60 Pro';
        return normalizar({
          ...item,
          modelo: esInfinixAntiguo ? base.modelo : item.modelo,
          sku: esInfinixAntiguo ? base.sku : item.sku,
          imagen: esInfinixAntiguo ? base.imagen : item.imagen,
          colores: (esInfinixAntiguo || !item.colores?.length) ? (base?.colores ?? []) : item.colores,
          imagenesPorColor:
              (!esInfinixAntiguo && item.imagenesPorColor && Object.keys(item.imagenesPorColor).length)
              ? item.imagenesPorColor
              : (base?.imagenesPorColor ?? {})
        });
      });
      guardarProductos(listaGuardada);
      return listaGuardada;
    }
  } catch (e) {
    // Si el almacenamiento está corrupto, se vuelve a cargar desde el JSON
  }

  guardarProductos(baseJson);
  return baseJson;
}

export function guardarProductos(lista) {
  localStorage.setItem(KEY, JSON.stringify(lista));
}

// Útil en pruebas: borra los cambios y vuelve a cargar el JSON original
export function reiniciarProductos() {
  localStorage.removeItem(KEY);
}