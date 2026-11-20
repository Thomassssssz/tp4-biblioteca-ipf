export class Pila<T> {
  #items: T[] = [];

  constructor(iniciales: Iterable<T> = []) {
    for (const item of iniciales) {
      this.apilar(item);
    }
  }

  apilar(item: T): void {
    this.#items.push(item);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  verTope(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  estaVacia(): boolean {
    return this.#items.length === 0;
  }

  get tamanio(): number {
    return this.#items.length;
  }

  //de la base al tope; es una copia para no exponer #items
  aArray(): T[] {
    return [...this.#items];
  }
}
