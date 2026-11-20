//usa indices de inicio y fin en lugar de shift() para desencolar en o(1)
export class Cola<T> {
  #items = new Map<number, T>();
  #inicio = 0;
  #fin = 0;

  constructor(iniciales: Iterable<T> = []) {
    for (const item of iniciales) {
      this.encolar(item);
    }
  }

  encolar(item: T): void {
    this.#items.set(this.#fin, item);
    this.#fin++;
  }

  desencolar(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    const item = this.#items.get(this.#inicio);
    this.#items.delete(this.#inicio);
    this.#inicio++;
    return item;
  }

  verFrente(): T | undefined {
    return this.#items.get(this.#inicio);
  }

  estaVacia(): boolean {
    return this.tamanio === 0;
  }

  get tamanio(): number {
    return this.#fin - this.#inicio;
  }

  //del frente al final; es una copia para no exponer #items
  aArray(): T[] {
    return [...this.#items.values()];
  }
}
