# ✅ Checklist: Fallback SeatMap — Production Ready

## 🔷 1️⃣ Корректная работа fallback-карты с сегментами
	•	При смене сегмента fallback сбрасывает состояние и загружает данные нового сегмента.
	•	Выбранные места возвращаются при возврате на сегмент.
	•	selectedSeats, allSelectedSeats, assignedSeats правильно фильтруются по segmentNumber.
	
	Данные о назначенных местах для пассажиров сохраняются для всех сегментов - ЭТО ПЕРВООЧЕРОЕДНАЯ ЗАДАЧА

📍 Файлы:
SeatMapComponentBase.tsx, SeatMapComponentPnr.tsx, useSeatMapAvailability.ts.

## 🔷 2️⃣  Автопереключение fallback
	•	При недоступности quicket.io fallback‑рендер активируется автоматически.
	•	Ошибки загрузки Quicket iframe (onError / useOnIframeLoad) обрабатываются корректно.
	•	Стейт useFallback / showFallback устанавливается в true при ошибке.
	•	После ошибки ререндерится компонент с React fallback‑картой.

📍 Файлы:
SeatMapComponentBase.tsx, useSeatMapInitErrorLogger.ts, useOnIframeLoad.ts.

⸻

## 🔷 3️⃣ Локализация
	•	Все новые тексты React fallback берутся из i18n (t(...)).
	•	Тултипы кресел: Bulkhead, Lavatory, Overwing, Exit, Restricted Recline, Power Outlet, Bassinet — локализованы.
	•	Заголовки панелей, кнопок (Save, Reset, Auto‑Assign, Loading seat map…) локализованы.
	•	Ошибки/уведомления (No seats selected, Error saving seats) локализованы.

📍 Файлы:
ReactSeatMapModal.tsx, PassengerPanel.tsx, SeatMapComponentBase.tsx.

⸻

## 🔷 4️⃣ Код‑ревью и косметика
	•	Убраны временные console.log, TODO, закомментированные старые строки.
	•	Inline‑стили и компоненты оформлены в единообразном стиле.
	•	Naming приведен к единому виду: FallbackSeatMap, ReactSeatMapModal, SeatmapInternal — выбран один вариант.
	•	Логика fallback вынесена в отдельный хук/утилиту (по возможности) — например, useFallbackSeatMapState.

📍 Файлы:
SeatMapComponentBase.tsx, ReactSeatMapModal.tsx, hooks/*.

⸻

## 🔷 5️⃣ Подготовка и отправка бандла в Sabre на сертификацию
	•	Собран финальный бандл Red App с новой версией fallback карты.
	•	В manifest.xml и version выставлены корректные номера версии, описание изменений.
	•	Проверен build на чистой среде (npm run build / yarn build) — ошибок нет.
	•	Прогон на внутренней среде: все ключевые сценарии работают, fallback включается при ошибке.
	•	В Red App бандл упакован в .zip с правильной структурой (META‑INF, код, манифест).
	•	Добавлены release notes для Sabre: кратко что изменилось, тестовые сценарии, как проверить fallback.
	•	Отправлен пакет на сертификацию через Sabre Developer Toolkit или портал Developer.sabre.com.

📍 Документы:
Release Notes, тестовые сценарии, Red App Bundle (.zip).

⸻

## 🎯 Цель:
✅ PNR c несколькими сегментами работают корректно с боевой и fallback-картой
✅ fallback включается сам при сбое
✅ нет хардкода текста, везде в компонентах есть комментарии на английском
✅ закончена локализация всех элементов UI
✅ код чистый и готов к ревью
✅ бандл готов к отправке в Sabre на сертификацию