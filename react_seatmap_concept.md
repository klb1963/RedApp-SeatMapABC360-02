# 🛫 React Seat Map – Fallback Rendering Concept

## 📌 Цель

🔹 Построить визуальное представление схемы салона самолета на основе **данных из Sabre (**``**)**, если по какой-либо причине нет ответа от `quicket.io`.

🔹 Поддерживает:

- корректную структуру рядов,
- отображение проходов (aisles),
- выделение выбранного кресла,
- блокировку занятых/забронированных мест.

---

## 🧹 Архитектура

### 1. `Seatmap.tsx` (`/internal/Seatmap.tsx`)

🔹 Главный визуальный компонент, отвечающий за отрисовку:

- всех рядов (`rows: Row[]`)
- внутри ряда — кресел и проходов (`seats: Seat[]`)

#### Интерфейсы:

```ts
interface Seat {
  id: string;           // уникальный ID ("12C")
  number?: string;      // буква кресла ("C")
  isReserved?: boolean; // блокировка
  tooltip?: string;     // текст подсказки
}

interface Row {
  rowNumber: number;
  seats: Seat[];
}
```

#### Особенности:

- Проходы реализуются как `Seat` с `number: undefined` и без `onClick`.
- Отображение выбранного места по `selectedSeatId`.

---

### 2. `ReactSeatMapRenderer.tsx`

🔹 Обёртка для `Seatmap`, передаёт:

- `rows` — массив `Row[]`
- `selectedSeatId` — текущее выбранное место
- `onSeatSelect` — callback при выборе места

---

### 3. `ReactSeatMapModal.tsx`

🔹 Тестовая модалка в RedApp:

- Загружает PNR через `loadPnrDetailsFromSabre`
- Загружает карту мест через `loadSeatMapFromSabre` (`EnhancedSeatMapRQ`)
- Прогоняет `seatInfo` через `convertSeatMapToReactSeatmapFormat`

#### Цикл:

```ts
useEffect(() => {
  1. Загружаем PNR
  2. Обогащаем пассажиров
  3. Загружаем SeatMap (EnhancedSeatMapRQ)
  4. Преобразуем в Row[]
  5. Передаём в <Seatmap />
}, []);
```

---

## 🧐 Обработка проходов (AISLE)

🔹 В XML-структуре Sabre ищем `Location.Detail code="A"` и/или `<Characteristics>description="Aisle"</Characteristics>`. 🔹 Позиция прохода между буквами обозначается `AISLE`, который вставляется в Row:

```ts
{
  id: `AISLE-${rowNumber}-${index}`,
  number: undefined,
  isReserved: true
}
```

---

## 💠 Пример Row

```ts
{
  rowNumber: 12,
  seats: [
    { id: '12A', number: 'A', isReserved: false },
    { id: '12B', number: 'B', isReserved: true },
    { id: '12C', number: 'C', isReserved: false },
    { id: 'AISLE-12-1', isReserved: true },
    { id: '12D', number: 'D', isReserved: false },
    { id: '12E', number: 'E', isReserved: false },
    { id: '12F', number: 'F', isReserved: false }
  ]
}
```

---

## 🥮 Отображение:

```
   12   [A] [B] [C]   |   [D] [E] [F]
                    ^ AISLE (gap)
```

---

## ✅ Конечный результат

🔹 Компонент `Seatmap`

- принимает Row[]
- рендерит карту мест
- поддерживает формат `EnhancedSeatMapRQ`
- не зависит от quicket.io

---

## 🚀 Дополнительно

- Отображение легенды (status colors)
- Несколько секций: business + economy (???)
- Статусы: preferred / paid / exit-row etc.
- Drag & drop / пересадка пассажиров

