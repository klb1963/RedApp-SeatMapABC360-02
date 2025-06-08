# 🧠 Project Context: RedApp module Seat Map ABC 360 

## 🏗️ Стек
- React + TypeScript (UI)
- Sabre Red 360 SDK (Eclipse / Tile Widgets)
- iframe-интеграция с quicket.io
- SOAP/REST API Sabre (GetReservationRS, EnhancedSeatMapRQ, AirSeatLLSRQ)

---
## 📋 Структура проекта
- `/components/seatMap/SeatMapComponentBase.tsx` – базовый компонент карты мест
- `/components/seatMap/SeatMapComponentAvail.tsx` – компонент сценария Availability
- `/components/seatMap/panels/` – UI-панели (PassengerPanel, SegmentSelector и др.)
- `/components/seatMap/helpers/` – утилиты (createPassengerPayload, postSeatMapUpdate и др.)
- `/utils/normalizeSegment.ts` – нормализация сегментов
- `/transformers/getFlightFromSabreData.ts` – генерация данных рейса для iframe

---
## 📦 Модели или что-то аналогичное
- `FlightSegment` – объект сегмента рейса (raw и normalized)
- `PassengerOption` – пассажир (id, label, nameNumber, type)
- `SelectedSeat` – выбранное место (passengerId, seatLabel и др.)
- `FlightData` – формат для iframe (id, airlineCode, departure, arrival, cabin и др.)
- `SeatMapMessagePayload` – структура сообщения postMessage в iframe

---
## ✅ Текущий статус
- ✅ Отображение карты мест в сценарии Availability через iframe
- ✅ Поддержка нескольких сегментов и переключения классов
- ✅ Корректная генерация flight-данных без повторной нормализации
- ✅ Передача config + flight + availability + passengers в библиотеку
- ✅ Отображение схем салона и всех доступных мест

---
## 🧠 Уроки из разработки модуля SeatMap ABC360

### ❌ Ошибки
1. **Повторная нормализация уже нормализованных данных**
   - Приводила к потере полей `duration`, `equipmentType`, `departureDate`.
2. **Смешивание нормализованных и raw-данных**
   - Нарушалась структура входных данных в `generateFlightData()`.
3. **Неправильное использование индексов сегментов**
   - Сбивалась логика выбора текущего сегмента.

### ✅ Решения
- Выполнять нормализацию один раз, при инициализации.
- Хранить `rawSegments` и `normalizedSegments` отдельно.
- В `generateFlightData()` всегда передавать raw-сегмент.
- Сегмент с индексом `index` из массива → оборачивать в массив и передавать с индексом `0` в `getFlightFromSabreData`.

### 📌 Выводы
| Ошибка                        | Урок                                                             |
|------------------------------|------------------------------------------------------------------|
| Повторная нормализация       | Нормализуй один раз и храни результат как источник правды.       |
| Смешанные данные             | Разделяй raw и normalized данные. Не смешивай.                   |
| Плавающий индекс             | Контролируй логику индексов и соблюдай source of truth.          |
| Потеря данных в flight       | Проверяй структуру перед отправкой в visualization iframe.       |


## ✅ Реализация отображения SeatMap в сценарии **Pricing**

**📌 Цель**  
Отображать схему салона (SeatMap) в модальном окне после завершения этапа ценообразования (Pricing), используя данные о сегменте рейса, переданные в контексте.

**📦 Компоненты, участвующие в цепочке**
- `PricingTile.ts`: вызывает `PricingView` через `IAirPricingService.createPricingTile(...)`
- `PricingView.ts`: модальное окно, в котором рендерится `SeatMapComponentPricing`
- `SeatMapComponentPricing.tsx`: обёртка, получающая сегмент рейса (`flightSegments[selectedSegmentIndex]`), нормализующая его и передающая в `SeatMapComponentBase`
- `SeatMapComponentBase.tsx`: базовый компонент, который инициализирует визуализацию карты мест, отправляя данные в iframe (библиотека quicket.io)

**🔄 Источник данных**  
Сегмент передаётся напрямую из `PricingTile` через `SharedContextModel`, далее поступает как проп `flightSegments` и `selectedSegmentIndex`. Ранее использовалось сохранение в `sessionStorage`, но теперь данные передаются напрямую.

**🧠 Ключевые детали**
- Компонент `SeatMapComponentPricing` больше **не использует sessionStorage**.
- Селектор сегментов (`SegmentCabinSelector`) работает на основе полученного массива `flightSegments` и позволяет выбирать рейс и класс обслуживания.
- Выбранный сегмент нормализуется через `normalizeSegment(...)`, чтобы получить данные в нужном формате.
- Компонент работает корректно как после стадии Shopping, так и после создания PNR.

**📸 Признак успеха**  
SeatMap отображается с корректной информацией: номер рейса, дата, направление, тип самолёта. Визуализация в iframe — активна и реагирует на выбор класса обслуживания.

**🔧 Последний шаг**  
Добавить CSS-класс seatmap-modal-lower к окну Pricing Tile, чтобы привести внешний вид в соответствие с другими сценариями (например, как в Availability и PNR).