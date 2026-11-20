export const colores = {
  primario: '#1F4E79',
  primarioClaro: '#DCE8F4',
  acento: '#C77C02',
  fondo: '#F6F4EF',
  superficie: '#FFFFFF',
  texto: '#1E1E1E',
  textoSecundario: '#5C5C5C',
  textoInvertido: '#FFFFFF',
  borde: '#DDD8CE',
  exito: '#2E7D32',
  error: '#B3261E',
  errorFondo: '#FBE9E7',
  aviso: '#8A5A00',
  avisoFondo: '#FFF4D6',
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const tipografia = {
  chica: 13,
  normal: 15,
  mediana: 17,
  grande: 20,
  titulo: 24,
} as const;

export const radios = {
  chico: 6,
  medio: 10,
  grande: 16,
} as const;

export const tamanios = {
  circuloIcono: 80,
  vistaCamara: 280,
} as const;

//area tactil minima recomendada por accesibilidad
export const TAMANIO_TACTIL_MINIMO = 44;
