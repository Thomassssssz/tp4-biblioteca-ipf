//useLocalSearchParams puede entregar un arreglo si el parametro se repite en la url
export function valorParametro(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? '';
  }
  return valor ?? '';
}
