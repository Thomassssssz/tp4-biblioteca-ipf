const FORMATO_ISBN = /^\d{13}$/;

export function esIsbnValido(isbn: string): boolean {
  return FORMATO_ISBN.test(isbn);
}
