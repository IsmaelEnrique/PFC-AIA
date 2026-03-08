export function calcularSubtotal(items = []) {
  return items.reduce((total, item) => {
    const precio = Number(item?.precio ?? 0);
    const cantidad = Number(item?.cantidad ?? 0);
    return total + precio * cantidad;
  }, 0);
}

export function calcularTotal(items = []) {
  return calcularSubtotal(items);
}
