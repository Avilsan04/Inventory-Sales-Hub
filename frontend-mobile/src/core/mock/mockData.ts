/**
 * Mock de desarrollo - equivalente al MSW de Sergio pero para React Native
 * Para desactivar: cambiar ENABLE_MOCK a false
 */

export const ENABLE_MOCK = true;

export const mockUser = {
  id: 1,
  username: 'mockuser',
  email: 'mock@example.com',
  token: 'mock-jwt-token-777',
};

export const mockProducts = [
  {
    id: 1,
    name: 'Teclado mecánico',
    description: 'Teclado mecánico RGB con switches Cherry MX',
    price: 89.99,
    stock: 15,
    imageUrl: null,
    categoryName: 'Informática',
  },
  {
    id: 2,
    name: 'Ratón inalámbrico',
    description: 'Ratón inalámbrico ergonómico con 6 botones',
    price: 34.99,
    stock: 8,
    imageUrl: null,
    categoryName: 'Informática',
  },
  {
    id: 3,
    name: 'Monitor 27"',
    description: 'Monitor Full HD 144Hz para gaming',
    price: 249.99,
    stock: 3,
    imageUrl: null,
    categoryName: 'Monitores',
  },
  {
    id: 4,
    name: 'Auriculares gaming',
    description: 'Auriculares con sonido 7.1 y micrófono retráctil',
    price: 59.99,
    stock: 20,
    imageUrl: null,
    categoryName: 'Audio',
  },
  {
    id: 5,
    name: 'Silla gaming',
    description: 'Silla ergonómica con soporte lumbar ajustable',
    price: 199.99,
    stock: 0,
    imageUrl: null,
    categoryName: 'Mobiliario',
  },
  {
    id: 6,
    name: 'Webcam HD',
    description: 'Webcam 1080p con micrófono integrado',
    price: 49.99,
    stock: 12,
    imageUrl: null,
    categoryName: 'Informática',
  },
];

export const mockOrders = [
  {
    id: 1,
    status: 'DELIVERED',
    total: 124.98,
    createdAt: '2026-04-10T10:30:00.000Z',
    items: [
      { productId: 2, productName: 'Ratón inalámbrico', quantity: 1, price: 34.99 },
      { productId: 1, productName: 'Teclado mecánico', quantity: 1, price: 89.99 },
    ],
  },
  {
    id: 2,
    status: 'PENDING',
    total: 59.99,
    createdAt: '2026-04-20T14:00:00.000Z',
    items: [
      { productId: 4, productName: 'Auriculares gaming', quantity: 1, price: 59.99 },
    ],
  },
];
