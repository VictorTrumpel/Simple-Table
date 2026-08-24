const path = require('node:path');
const XLSX = require('xlsx');

const ROW_COUNT = 5000;
const OUTPUT_FILE = path.join(process.cwd(), 'orders-5000.xlsx');

const firstNames = [
  'Александр',
  'Анна',
  'Дмитрий',
  'Елена',
  'Иван',
  'Мария',
  'Михаил',
  'Наталья',
  'Павел',
  'София',
];
const lastNames = [
  'Иванов',
  'Смирнов',
  'Кузнецов',
  'Попов',
  'Соколов',
  'Лебедев',
  'Козлов',
  'Новиков',
  'Морозов',
  'Волков',
];
const cities = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Екатеринбург',
  'Новосибирск',
  'Самара',
  'Омск',
  'Пермь',
  'Уфа',
  'Ростов-на-Дону',
];
const products = [
  { name: 'Ноутбук NovaBook 14', category: 'Электроника', price: 72990 },
  { name: 'Смартфон Pulse X', category: 'Электроника', price: 46990 },
  { name: 'Наушники Wave Pro', category: 'Аксессуары', price: 8990 },
  { name: 'Клавиатура KeyFlow', category: 'Аксессуары', price: 5490 },
  { name: 'Монитор Vision 27', category: 'Электроника', price: 32990 },
  { name: 'Офисное кресло Balance', category: 'Мебель', price: 24990 },
  { name: 'Настольная лампа LightUp', category: 'Дом и офис', price: 3990 },
  { name: 'Рюкзак CityPack', category: 'Аксессуары', price: 6490 },
  { name: 'Кофемашина Aroma', category: 'Бытовая техника', price: 38990 },
  { name: 'Умная колонка Voice Mini', category: 'Электроника', price: 11990 },
];
const statuses = ['Новый', 'Оплачен', 'Отправлен', 'Доставлен', 'Отменён'];

// Детерминированный генератор: повторный запуск создаёт тот же набор данных.
let seed = 42;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
}

function pick(items) {
  return items[Math.floor(random() * items.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + random() * (end.getTime() - start.getTime()));
}

const rows = Array.from({ length: ROW_COUNT }, (_, index) => {
  const product = pick(products);
  const quantity = 1 + Math.floor(random() * 5);
  const price = Math.round(product.price * (0.95 + random() * 0.1));

  return {
    'ID заказа': `ORD-${String(index + 1).padStart(6, '0')}`,
    'Дата заказа': randomDate(new Date(2025, 0, 1), new Date(2025, 11, 31)),
    Клиент: `${pick(firstNames)} ${pick(lastNames)}`,
    Город: pick(cities),
    Товар: product.name,
    Категория: product.category,
    Количество: quantity,
    'Цена, ₽': price,
    'Сумма, ₽': price * quantity,
    Статус: pick(statuses),
  };
});

const worksheet = XLSX.utils.json_to_sheet(rows, { cellDates: true });
worksheet['!cols'] = [
  { wch: 14 },
  { wch: 14 },
  { wch: 24 },
  { wch: 20 },
  { wch: 27 },
  { wch: 20 },
  { wch: 12 },
  { wch: 12 },
  { wch: 14 },
  { wch: 12 },
];
worksheet['!autofilter'] = { ref: worksheet['!ref'] };

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');
XLSX.writeFile(workbook, OUTPUT_FILE, { compression: true });

console.log(`Создан файл: ${OUTPUT_FILE}`);
console.log(`Записей: ${ROW_COUNT}, колонок: ${Object.keys(rows[0]).length}`);
