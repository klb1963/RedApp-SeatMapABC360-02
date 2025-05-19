// file: uploadToS3.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const REGION = 'default'; // можно оставить 'default' для idrive e2
const BUCKET_NAME = 'seatmapabc360-enhancedseatmaprq-logs';
const ENDPOINT = 'https://p1t1.fra.idrivee2-28.com';

const ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error('❌ Missing S3 credentials in environment variables.');
  }

const s3 = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function uploadXmlToS3(xmlContent: string) {
  const fileName = `enhanced-seatmap-${new Date().toISOString()}-${randomUUID()}.xml`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: xmlContent,
    ContentType: 'application/xml',
  });

  try {
    const result = await s3.send(command);
    console.log(`✅ XML uploaded to S3: ${fileName}`);
    return result;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}