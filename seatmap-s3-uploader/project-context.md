
# 📁 project-context.md — SeatMap-S3-Uploader

📌 Назначение

Этот мини-проект используется для загрузки XML-ответов от Sabre (например, EnhancedSeatMapRS) в S3-совместимое хранилище iDrive® e2.
Он вызывается из Sabre RedApp после получения SOAP-ответа и сохраняет XML в удалённый бакет для логирования и отладки.

⸻
📂 Структура проекта

SeatMap-S3-Uploader/
├── .env                         # Ключи доступа к S3
├── index.ts                    # Тестовый запуск с sample XML
├── uploadToS3.ts               # Основная логика загрузки в S3
├── package.json
└── project-context.md          # (вот этот файл)

⸻
⚙️ Переменные окружения (.env)

S3_ACCESS_KEY_ID=5VZFMgxWURL8tu3SuO5Y
S3_SECRET_ACCESS_KEY=ZzI9yuW95jQmOqTbhw9BQtaRq7jeEoBmEk2wzYOq


⸻
🌍 Параметры S3 (iDrive® e2)
	•	Бакет: seatmapabc360-enhancedseatmaprq-logs
	•	Эндпойнт: https://p1t1.fra.idrivee2-28.com
	•	Регион: default (для iDrive® e2 так и оставляем)

⸻
▶️ Как запустить
	1.	Убедись, что .env файл с ключами существует в корне проекта.
	2.	Установи зависимости:

npm install

	3.	Запусти:

npx tsx index.mts


⸻
🧠 Как использовать из RedApp

Внутри функции loadSeatMapFromSabre.ts, после получения EnhancedSeatMapRS, просто вызови:

await uploadXmlToS3(xmlString);

⸻
📝 TODO
	•	Добавить логирование ошибок в отдельный файл
	•	Протестировать загрузку больших XML (> 1 МБ)
	•	Настроить retries при временных ошибках S3
