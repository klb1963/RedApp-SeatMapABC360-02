# 🛠️ README-debug.md — SeatMap ABC360: Разбор багов и граблей

Этот файл содержит описание реальных ошибок, допущенных в ходе разработки SeatMap ABC360, и объясняет их причины. Он создан для того, чтобы в будущем избежать повторения подобных ситуаций.

⸻

## ❌ Ошибка №1 — Неправильный ручной маппинг cabinClass в generateFlightData

Контекст:
В сценарии Availability вручную передавался параметр cabinClass внутрь generateFlightData, вот так:

flightSegments: [{
  ...normalized,
  cabinClass,
  equipment: normalized.equipmentType
}]

В чём была ошибка:
	•	Значение cabinClass в этом месте уже было строкой вроде 'E' (от библиотеки).
	•	А generateFlightData() ожидал от Sabre-классы: 'Y', 'C', 'F', и сам должен был их маппить в 'E', 'B' и т.д.
	•	Таким образом, произошло двойное преобразование, и в результате в итоговых данных о сегменте был неправильный bookingClassCode.

Следствие:
	•	Авторассадка (autoAssignSeats) не могла найти валидные места, потому что класс был невалидный.
	•	Сценарии отображения карты мест ломались «молча» — без явной ошибки.

Решение:
Удалить передачу cabinClass в generateFlightData().

Итог:

generateFlightData={() => {
  return getFlightFromSabreData({
    flightSegments: [{
      ...normalized,
      equipment: normalized.equipmentType
    }]
  }, 0);
}}


⸻

## 🔎 Как избежать в будущем
	1.	Никогда не передавай cabinClass в generateFlightData, если он уже используется внутри функции.
	2.	Все классы обслуживания:
	•	от Sabre → Y, S, C, F, A
	•	для библиотеки → E, P, B, F, A
	3.	Функция mapCabinToCode() отвечает за преобразование между этими форматами.
	4.	Проверяй в консоли: 🧪 final cabinClass перед отправкой в библиотеку.

⸻

## 🧠 Урок

Один cabinClass, вставленный не туда — и ты теряешь день.

Теперь ты знаешь, куда смотреть первым делом. 😎