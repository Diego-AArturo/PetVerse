import { createHash } from 'crypto'; // id unico para cada lugar 

// molde de como se ve un lugar
export interface Place {
  id: string;
  source: string;
  name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  extra: Record<string, any>;
}

// asegurando que dos lugares iguales tengan el mismo id
export function buildPlace(data: Omit<Place, 'id' | 'country'>): Place {
  const id = createHash('md5')
    .update(`${data.name}${data.lat}${data.lng}`)
    .digest('hex');

  return {
    id,
    country: 'Colombia',
    ...data,
  };
}

// Recibe texto crudo de cualquier API y lo convierte a una categoría estándar de PetVerse
export function mapCategory(raw: string): string {
  const r = raw.toLowerCase();

  if (r.includes('veterinary') || r.includes('veterinaria')) return 'veterinary';
  if (r.includes('pet_store') || r.includes('tienda mascotas')) return 'pet_store';
  if (r.includes('animal_shelter') || r.includes('refugio')) return 'shelter';
  if (r.includes('heladería') || r.includes('helado')) return 'pet_food';
  if (r.includes('peluquería') || r.includes('grooming')) return 'pet_grooming';
  if (r.includes('guardería') || r.includes('hotel mascotas')) return 'pet_hotel';
  if (r.includes('spa')) return 'pet_spa';
  if (r.includes('pet friendly') || r.includes('park')) return 'pet_friendly';

  return 'other';
}

// lee la direccion y extrae la ciudad 
export function detectCity(address: string, lat?: number, lng?: number): string {
  if (!address) return 'Unknown';

  const a = address.toLowerCase();

  if (a.includes('cali')) return 'Cali';
  if (a.includes('palmira')) return 'Palmira';
  if (a.includes('bogotá') || a.includes('bogota')) return 'Bogotá';
  if (a.includes('medellín') || a.includes('medellin')) return 'Medellín';
  if (a.includes('barranquilla')) return 'Barranquilla';
  if (a.includes('cartagena')) return 'Cartagena';
  if (a.includes('bucaramanga')) return 'Bucaramanga';
  if (a.includes('pereira')) return 'Pereira';
  if (a.includes('manizales')) return 'Manizales';
  if (a.includes('santa marta')) return 'Santa Marta';
  if (a.includes('ibagué') || a.includes('ibague')) return 'Ibagué';
  if (a.includes('cúcuta') || a.includes('cucuta')) return 'Cúcuta';
  if (a.includes('villavicencio')) return 'Villavicencio';
  if (a.includes('pasto')) return 'Pasto';
  if (a.includes('montería') || a.includes('monteria')) return 'Montería';
  if (a.includes('armenia')) return 'Armenia';
  if (a.includes('neiva')) return 'Neiva';
  if (a.includes('popayán') || a.includes('popayan')) return 'Popayán';
  if (a.includes('valledupar')) return 'Valledupar';
  if (a.includes('sincelejo')) return 'Sincelejo';

  return 'Colombia';
}