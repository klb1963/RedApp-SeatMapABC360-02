// file: /code/services/sendXmlToUploader.ts

// 🧩 Service function to send EnhancedSeatMapRQ/RS XML to an external uploader (e.g., Node.js server → S3)
// Uses Sabre RedApp's ExternalServiceConnector to bypass browser CORS restrictions

import { getService } from '../Context';
import {ExternalServiceConnector} from 'sabre-ngv-app/app/services/impl/ExternalServiceConnector';

export function sendXmlToUploader(xmlContent: string): Promise<void> {
    // 🔌 Get instance of ExternalServiceConnector from Sabre SDK
    const externalServiceConnector = getService(ExternalServiceConnector);
  
    // 🌍 Target server endpoint (Node.js uploader listening locally)
    const url = 'http://localhost:4000/upload';

    // 📬 HTTP request details
    const method = 'POST';
    const headers = {
      'Content-Type': 'application/xml',
      'X-Auth': 'leonid-secret' // 🔐 Simple token-based auth header (validated server-side)
    };
    const body = xmlContent;
    const credentials = 'omit'; // ❌ No cookies or credentials sent (not needed for this case)
  
    // 📤 Send the request using RedApp's asynchronous connector
    return new Promise((resolve, reject) => {
      externalServiceConnector
        .callService(url, method, body, headers, credentials)
        .done((response) => {
          console.log('✅ XML uploaded via callService()', response);
          resolve();
        })
        .fail((error) => {
          console.warn('⚠️ Failed to send XML via callService():', error);
          reject(error);
        });
    });
  }