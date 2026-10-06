export function filterAndSortOrders(orders, filters) {
  const {
    search = '',
    status = '',
    payment = '',
    dateFrom = '',
    dateTo = '',
    sortCol = 'date',
    sortDir = 'desc',
  } = filters;
  const query = search.trim().toLocaleLowerCase('fr');
  const direction = sortDir === 'asc' ? 1 : -1;

  return orders
    .filter((order) => {
      if (status && order.order_status !== status) return false;
      if (payment && order.payment_status !== payment) return false;

      const orderDate = order.created_at ? String(order.created_at).slice(0, 10) : '';
      if (dateFrom && (!orderDate || orderDate < dateFrom)) return false;
      if (dateTo && (!orderDate || orderDate > dateTo)) return false;

      if (query) {
        const searchable = [
          order.order_number,
          order.customer_name,
          order.customer_email,
          order.customer_phone,
          order.shipping_city,
          order.shipping_address,
        ];
        if (!searchable.some((value) => String(value ?? '').toLocaleLowerCase('fr').includes(query))) {
          return false;
        }
      }
      return true;
    })
    .sort((first, second) => {
      if (sortCol === 'total') {
        return direction * ((Number(first.total) || 0) - (Number(second.total) || 0));
      }
      const firstDate = Date.parse(first.created_at) || 0;
      const secondDate = Date.parse(second.created_at) || 0;
      return direction * (firstDate - secondDate);
    });
}
