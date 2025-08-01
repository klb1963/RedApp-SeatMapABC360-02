# ✅ Checklist: Fallback SeatMap — Production Ready

⸻

## 🔷 1️⃣ Корректная работа fallback-карты с сегментами

✅ При смене сегмента fallback сбрасывает состояние и загружает данные нового сегмента
✅ Выбранные места возвращаются при возврате на сегмент
✅ selectedSeats, allSelectedSeats, assignedSeats правильно фильтруются по segmentNumber

📍 Проверено в файлах:
 • SeatMapComponentBase.tsx
 • SeatMapComponentPnr.tsx
 • useSeatMapAvailability.ts

📍 Статус:
✔️ Данные о назначенных местах для пассажиров сохраняются для всех сегментов — DONE

⸻

## 🔷 2️⃣ Автопереключение fallback

✅ При недоступности quicket.io fallback‑рендер активируется автоматически
✅ Ошибки загрузки Quicket iframe (onError / useOnIframeLoad) обрабатываются корректно
✅ Стейт useFallback / showFallback устанавливается в true при ошибке
✅ После ошибки ререндерится компонент с React fallback‑картой

📍 Проверено в файлах:
 • SeatMapComponentBase.tsx
 • useSeatMapInitErrorLogger.ts
 • useOnIframeLoad.ts

📍 Статус:
✔️ Реализовано + протестировано, заголовок и скрытие SegmentCabinSelector добавлены — DONE

⸻

## 🔷 3️⃣ Вызов карт через команду в консли Sabre §321 - боевая,  §123 - fallback

✅ Зарегистрированы custom command §360 и §123 в manifest.json
✅ Добавлен сервис SeatMapABC360CommandHandler в manifest.json
✅ Реализован хендлер SeatMapABC360CommandHandler.ts с рендерингом fallback ReactSeatMapModal
✅ Зарегистрирован сервис в Main.ts через registerService(SeatMapABC360CommandHandler)
✅ Проведены успешные тесты отображения fallback карты по команде §123 на открытие карты мест текущего PNR

📍 Статус:
✔️ Теперь боевая карта доступна через команду в консоли RedApp §360, а fallback карта доступна для запуска вручную через §123 — DONE

⸻

## 🔷 4️⃣ Переименовать кнопку «Show Agent Profile» → «Seat Map ABC 360 Setup»

• Было: Show Agent Profile
• Стало: Seat Map ABC 360 Setup/Configuration
• Убедиться, что она вызывает актуальную панель/страницу настройки
• Добавить поля: APP_URL, APP_ID, APP_KEY
• Реализовать сохранение параметров по кнопке SAVE с помощью IModulePreferencesService (хранение внутри RedApp)

📍 Статус:
🔷 DONE

⸻

## 🔷 5️⃣ Локализация

✅ Все новые тексты React fallback берутся из i18n (t(…))
✅ Тултипы кресел: Bulkhead, Lavatory, Overwing, Exit, Restricted Recline, Power Outlet, Bassinet — локализованы
✅ Заголовки панелей, кнопок (Save, Reset, Auto‑Assign, Loading seat map…) локализованы
✅ Ошибки/уведомления (No seats selected, Error saving seats) локализованы

📍 Проверено в файлах:
 • ReactSeatMapModal.tsx
 • PassengerPanel.tsx
 • SeatMapComponentBase.tsx

📍 Статус:
✔️ Все тексты подготовлены для локализации — ???????

⸻

## 🔷 6️⃣ Код‑ревью и косметика

✅ Убраны временные console.log, TODO, закомментированные старые строки
✅ Inline‑стили и компоненты оформлены в единообразном стиле
✅ Naming приведен к единому виду: FallbackSeatmap, ReactSeatMapModal, SeatmapInternal
✅ Логика fallback вынесена в useSeatMapInitErrorLogger — отдельный хук

📍 Проверено в файлах:
 • SeatMapComponentBase.tsx
 • ReactSeatMapModal.tsx
 • hooks/*

📍 Статус:
✔️ Пройдена ревизия и рефакторинг — DONE

⸻

## 🔷 7️⃣ Подготовка и отправка бандла в Sabre на сертификацию

✅ Собран финальный бандл Red App с новой версией fallback карты
✅ В manifest.xml и version выставлены корректные номера версии, описание изменений
✅ Проверен build на чистой среде (npm run build) — ошибок нет
✅ Прогон на внутренней среде: все ключевые сценарии работают, fallback включается при ошибке
✅ В Red App бандл упакован в .zip с правильной структурой (META‑INF, код, манифест)
✅ Добавлены Release Notes для Sabre: кратко что изменилось, тестовые сценарии, как проверить fallback
✅ Отправлен пакет на сертификацию через Sabre Developer Toolkit или портал Developer.sabre.com

📍 Документы:
 • Release Notes
 • Тестовые сценарии
 • Red App Bundle (.zip)

📍 Статус:
🔷 Подготовить финальный .zip и Notes — в работе

⸻

## 🔷 8️⃣ Финальная сборка в папке RedApp-SeatMap-ABC-360

✅ Когда завершены все проверки и зафиксированы изменения в RedApp-SeatMap-ABC-360-02:
🔷 Создать чистую копию в RedApp-SeatMap-ABC-360
🔷 Удалить из нее все вспомогательные кнопки (Create Test PNR, Get EnhancedSeatMapRQ, Show PNR Info, SeatMap Fallback) и связанные с ними методы
🔷 Переименовать Show Agent Profile → Seat Map ABC 360 Setup/Configuration
🔷 Добавить вызов команды Seat Map ABC 360 в манифест и код (если требуется)
🔷 Еще раз обновить локализацию под новую надпись
🔷 Прогнать npm run build и собрать .zip
🔷 Финальный smoke‑тест
🔷 Отправить на сертификацию

📍 Почему кнопки убираем только в этой папке?
✔️ Чтобы в RedApp-SeatMap-ABC-360-02 остался весь отладочный и тестовый функционал.

⸻

🎯 Цель:

✅ PNR c несколькими сегментами работают корректно с боевой и fallback-картой - ОК
✅ fallback включается сам при сбое - ОК
✅ карта вызывается по команде из консоли - ОК
✅ нет хардкода текста, везде в компонентах t(…)
✅ закончена локализация всех элементов UI
✅ код чистый и готов к ревью
✅ бандл готов к отправке в Sabre на сертификацию
