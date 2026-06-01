import 'dotenv/config';
import { buildPlace, mapCategory, detectCity } from '../../utils/normalize.js';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

const TIPOS_BUSQUEDA = [
  'veterinaria',
  'tienda mascotas',
  'pet friendly',
  'heladería mascotas',
  'peluquería canina',
  'guardería mascotas',
  'hotel mascotas',
  'spa mascotas',
];

// GRILLA POR PAÍS - para que sea mas facil de expandir despues
// Con paso de 1.5 grados (~150km) generamos ~20 puntos

const PAISES: Record<string, {
  sur: number; norte: number; oeste: number; este: number;
  paso: number; nombre: string;
}> = {
  colombia: {
    sur: -4.2, norte: 13.4,
    oeste: -79.0, este: -66.9,
    paso: 1.8,  // ~200km entre puntos
    nombre: 'Colombia'
  },

};


// Genera grilla de puntos dentro del bounding box del país
interface GridPoint {
  lat: number;
  lng: number;
  pais: string;
}

function generarGrilla(paisKey: string): GridPoint[] {
  const pais = PAISES[paisKey];
  if (!pais) throw new Error(`País "${paisKey}" no configurado`);

  const puntos: GridPoint[] = [];

  for (let lat = pais.sur; lat <= pais.norte; lat += pais.paso) {
    for (let lng = pais.oeste; lng <= pais.este; lng += pais.paso) {
      puntos.push({
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        pais: pais.nombre,
      });
    }
  }

  return puntos;
}

// llamada a google por cada punto de la grilla y cada tipo de búsqueda
async function fetchPage(
  query: string,
  apiKey: string,
  lat: number,
  lng: number,
  pagetoken?: string
) {
  const params = new URLSearchParams({
    query,
    key: apiKey,
    language: 'es',
    location: `${lat},${lng}`,
    radius: '100000', // 100km de radio por punto
  });
  if (pagetoken) params.set('pagetoken', pagetoken);

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

// Normalizar el resultado de Google al formato estándar de PetVerse
function normalize(place: any, queryHint: string) {
  const loc = place.geometry?.location ?? {};
  return buildPlace({
    source: 'google',
    name: place.name,
    category: mapCategory((place.types ?? []).join(' ') + ' ' + queryHint),
    address: place.formatted_address,
    city: detectCity(place.formatted_address, loc.lat, loc.lng),
    lat: loc.lat ?? null,
    lng: loc.lng ?? null,
    phone: place.formatted_phone_number ?? null,
    website: place.website ?? null,
    rating: place.rating ?? null,
    extra: {
      place_id: place.place_id,
      types: place.types ?? [],
      user_ratings_total: place.user_ratings_total ?? null,
      business_status: place.business_status ?? null,
      opening_hours: place.opening_hours?.weekday_text ?? null,
    },
  });
}

// Función principal para obtener lugares de Google Places API usando la grilla y tipos definidos
export async function fetchGooglePlaces(paisKey: string = 'colombia') {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('[Google] GOOGLE_API_KEY no configurada — saltando');
    return [];
  }

  // Generar grilla de puntos para el país
  const grilla = generarGrilla(paisKey);
  const totalLlamadas = grilla.length * TIPOS_BUSQUEDA.length * 3;

  console.log(`[Google] País: ${PAISES[paisKey].nombre}`);
  console.log(`[Google] Puntos de grilla: ${grilla.length}`);
  console.log(`[Google] Tipos de búsqueda: ${TIPOS_BUSQUEDA.length}`);
  console.log(`[Google] Máximo llamadas estimadas: ${totalLlamadas}`);
  console.log(`[Google] Costo estimado: ~$${((totalLlamadas / 1000) * 32).toFixed(2)} USD`);
  console.log(`[Google] Iniciando...\n`);

  const raw: any[] = [];
  const vistos = new Set<string>(); // evita duplicados por place_id
  let puntoActual = 0;

  for (const punto of grilla) {
    puntoActual++;
    console.log(`[Google] Punto ${puntoActual}/${grilla.length} — lat:${punto.lat} lng:${punto.lng}`);

    for (const tipo of TIPOS_BUSQUEDA) {
      const query = `${tipo} en ${punto.pais}`;

      try {
        let page = await fetchPage(query, apiKey, punto.lat, punto.lng);
        const resultados = page.results ?? [];

        // Filtrar duplicados por place_id
        for (const place of resultados) {
          if (!vistos.has(place.place_id)) {
            vistos.add(place.place_id);
            raw.push(normalize(place, tipo));
          }
        }

        // Paginación — hasta 2 páginas extra (60 resultados max por punto+tipo)
        let pagesLoaded = 0;
        while (page.next_page_token && pagesLoaded < 2) {
          await new Promise(r => setTimeout(r, 2000)); // delay requerido por Google
          page = await fetchPage(query, apiKey, punto.lat, punto.lng, page.next_page_token);

          for (const place of page.results ?? []) {
            if (!vistos.has(place.place_id)) {
              vistos.add(place.place_id);
              raw.push(normalize(place, tipo));
            }
          }
          pagesLoaded++;
        }

      } catch (err: any) {
        console.error(`[Google] Error en "${query}" (${punto.lat},${punto.lng}): ${err.message}`);
      }

      // Pausa entre tipos para no saturar
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\n[Google] Completado`);
  console.log(`[Google] Lugares únicos encontrados: ${raw.length}`);
  console.log(`[Google] Duplicados eliminados: ${vistos.size - raw.length}`);

  return raw;
}

