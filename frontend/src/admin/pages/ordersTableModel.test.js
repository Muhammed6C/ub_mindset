import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortOrders } from './ordersTableModel.js';

const orders = [
  {
    id: 1,
    order_number: 'UB-001',
    customer_name: 'Awa Ndiaye',
    shipping_city: 'Dakar',
    order_status: 'pending',
    payment_status: 'paid',
    total: 12000,
    created_at: '2026-10-02T22:00:00.000Z',
  },
  {
    id: 2,
    order_number: 'UB-002',
    customer_name: 'Moussa Ba',
    shipping_city: 'Thiès',
    order_status: 'shipped',
    payment_status: 'pending',
    total: 24000,
    created_at: '2026-10-03T08:00:00.000Z',
  },
  {
    id: 3,
    order_number: 'UB-003',
    customer_name: 'Fatou Fall',
    shipping_city: 'Dakar',
    order_status: 'delivered',
    payment_status: 'paid',
    total: 18000,
    created_at: '2026-10-04T08:00:00.000Z',
  },
];

test('combines search, status, payment and inclusive calendar date filters', () => {
  const result = filterAndSortOrders(orders, {
    search: 'dakar',
    status: 'pending',
    payment: 'paid',
    dateFrom: '2026-10-02',
    dateTo: '2026-10-02',
  });

  assert.deepEqual(result.map(({ id }) => id), [1]);
});

test('search matches order number, contact and delivery details', () => {
  assert.deepEqual(
    filterAndSortOrders(orders, { search: 'thiès' }).map(({ id }) => id),
    [2],
  );
  assert.deepEqual(
    filterAndSortOrders(orders, { search: 'UB-003' }).map(({ id }) => id),
    [3],
  );
});

test('sorts without mutating the source list', () => {
  const originalOrder = orders.map(({ id }) => id);

  assert.deepEqual(
    filterAndSortOrders(orders, { sortCol: 'total', sortDir: 'asc' }).map(({ id }) => id),
    [1, 3, 2],
  );
  assert.deepEqual(orders.map(({ id }) => id), originalOrder);
});
