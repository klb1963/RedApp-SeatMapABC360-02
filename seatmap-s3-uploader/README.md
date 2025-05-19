# 🧾 SeatMap XML Logging to S3

## 🎯 Цель

После каждого запроса `EnhancedSeatMapRQ` из RedApp, XML-ответ автоматически отправляется на сервер (Node.js), который загружает его в iDrive® S3 (endpoint `https://p1t1.fra.idrivee2-28.com`, бакет `seatmapabc360-enhancedseatmaprq-logs`).

---

## 🔗 Архитектура
RedApp
│
├── loadSeatMapFromSabre.ts
│   └─ calls sendXmlToUploader(rawXml)
│
└── ExternalServiceConnector → http://localhost:4000/upload
│
└── seatmap-s3-uploader (Node.js + Express)
└─ uploadToS3 → iDrive S3

---

## 🚀 Технологии

- RedApp SDK (Sabre Red 360)
- `ExternalServiceConnector`
- Node.js + Express + `@aws-sdk/client-s3`
- iDrive® e2 S3-compatible storage

---

## 🔐 Защита

- Заголовок `X-Auth: leonid-secret`
- Максимальный размер XML: `2mb`
- CORS включён: `origin: *` (на тесте)

---

## 🧪 Локальный запуск сервера

```bash
cd seatmap-s3-uploader
npm install
npx tsx index.mts