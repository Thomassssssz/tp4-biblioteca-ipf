import type { Libro } from '../types';

//isbn de libros fisicos para probar el escaner: reemplazar estos dos valores
export const ISBN_FISICO_1 = '9780000000019';
export const ISBN_FISICO_2 = '9780000000026';

//los isbn de catalogo son ficticios pero con digito verificador ean-13 valido
export const LIBROS: Libro[] = [
  {
    isbn: ISBN_FISICO_1,
    titulo: 'Libro físico 1 (reemplazar)',
    autor: 'Autor a completar',
    anio: 2020,
    ejemplares: 1,
  },
  {
    isbn: ISBN_FISICO_2,
    titulo: 'Libro físico 2 (reemplazar)',
    autor: 'Autor a completar',
    anio: 2020,
    ejemplares: 0,
  },
  {
    isbn: '9789500700016',
    titulo: 'Ficciones',
    autor: 'Jorge Luis Borges',
    anio: 1944,
    ejemplares: 2,
  },
  {
    isbn: '9789500700023',
    titulo: 'El Aleph',
    autor: 'Jorge Luis Borges',
    anio: 1949,
    ejemplares: 0,
  },
  {
    isbn: '9789500700030',
    titulo: 'Rayuela',
    autor: 'Julio Cortázar',
    anio: 1963,
    ejemplares: 1,
  },
  {
    isbn: '9789500700047',
    titulo: 'Bestiario',
    autor: 'Julio Cortázar',
    anio: 1951,
    ejemplares: 3,
  },
  {
    isbn: '9789500700054',
    titulo: 'Martín Fierro',
    autor: 'José Hernández',
    anio: 1872,
    ejemplares: 4,
  },
  {
    isbn: '9789500700061',
    titulo: 'Sobre héroes y tumbas',
    autor: 'Ernesto Sabato',
    anio: 1961,
    ejemplares: 0,
  },
  {
    isbn: '9789500700078',
    titulo: 'El túnel',
    autor: 'Ernesto Sabato',
    anio: 1948,
    ejemplares: 2,
  },
  {
    isbn: '9789500700085',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    anio: 1967,
    ejemplares: 1,
  },
  {
    isbn: '9789500700092',
    titulo: 'Pedro Páramo',
    autor: 'Juan Rulfo',
    anio: 1955,
    ejemplares: 2,
  },
  {
    isbn: '9789500700108',
    titulo: 'Cuentos de la selva',
    autor: 'Horacio Quiroga',
    anio: 1918,
    ejemplares: 3,
  },
  {
    isbn: '9789500700115',
    titulo: 'Facundo',
    autor: 'Domingo F. Sarmiento',
    anio: 1845,
    ejemplares: 1,
  },
  {
    isbn: '9789500700122',
    titulo: 'Don Segundo Sombra',
    autor: 'Ricardo Güiraldes',
    anio: 1926,
    ejemplares: 0,
  },
  {
    isbn: '9789500700139',
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    anio: 2008,
    ejemplares: 2,
  },
  {
    isbn: '9789500700146',
    titulo: 'JavaScript: The Good Parts',
    autor: 'Douglas Crockford',
    anio: 2008,
    ejemplares: 1,
  },
  {
    isbn: '9789500700153',
    titulo: 'Estructuras de datos y algoritmos',
    autor: 'Alfred V. Aho',
    anio: 1983,
    ejemplares: 0,
  },
];

//personas que ya esperan al iniciar la app, de la primera a la ultima
export const ESPERAS_INICIALES: Record<string, readonly string[]> = {
  '9789500700023': ['Lucía Benítez', 'Marcos Ortiz'],
  '9789500700061': ['Sofía Romero'],
};
