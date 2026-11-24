// Fuente de productos compartida por el administrador y el catálogo.
const KEY = 'tcno_productos';
const JSON_URL = new URL('../../data/celulares.json', import.meta.url);

export const OPCIONES = {
  marcas: ['Samsung', 'Apple', 'Xiaomi', 'Motorola', 'Huawei', 'Tecno', 'Oppo', 'Infinix', 'Nubia'],
  almacenamientos: [64, 128, 256, 512],
  etiquetas: ['Nuevo', 'En oferta'],
  colores: {
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
        const esInfinixAntiguo = Boolean(base && item.id === 15 && item.modelo === 'Note 60 Pro');
        // Completa datos técnicos de copias antiguas si pertenecen al mismo equipo.
        const ficha = esInfinixAntiguo || (item.sku && item.sku === base?.sku) ? base : undefined;
        return normalizar({
          ...item,
          modelo: esInfinixAntiguo ? base.modelo : item.modelo,
          sku: esInfinixAntiguo ? base.sku : item.sku,
          imagen: esInfinixAntiguo ? base.imagen : item.imagen,
          colores: (esInfinixAntiguo || !item.colores?.length) ? (base?.colores ?? []) : item.colores,
          imagenesPorColor:
            (!esInfinixAntiguo && item.imagenesPorColor && Object.keys(item.imagenesPorColor).length)
              ? item.imagenesPorColor
              : (base?.imagenesPorColor ?? {}),
          pantalla: esInfinixAntiguo ? ficha.pantalla : (item.pantalla || ficha?.pantalla),
          camaraPrincipal: esInfinixAntiguo ? ficha.camaraPrincipal : (item.camaraPrincipal ?? ficha?.camaraPrincipal),
          fuenteEspecificaciones: esInfinixAntiguo
            ? ficha.fuenteEspecificaciones
            : (item.fuenteEspecificaciones || ficha?.fuenteEspecificaciones)
        });
      });
      guardarProductos(listaGuardada);
      return listaGuardada;
    }
  } catch (e) {
    // Si el almacenamiento está corrupto, se vuelve a cargar desde el JSON.
  }

  guardarProductos(baseJson);
  return baseJson;
}

export function guardarProductos(lista) {
  localStorage.setItem(KEY, JSON.stringify(lista));
}

export function reiniciarProductos() {
  localStorage.removeItem(KEY);
}
