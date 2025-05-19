// file: /code/services/sendXmlToUploader.ts

import { getService } from '../Context';
import {ExternalServiceConnector} from 'sabre-ngv-app/app/services/impl/ExternalServiceConnector';

export function sendXmlToUploader(xmlContent: string): Promise<void> {
    const externalServiceConnector = getService(ExternalServiceConnector);
  
    const url = 'http://localhost:4000/upload';
    const method = 'POST';
    const headers = {
      'Content-Type': 'application/xml',
      'X-Auth': 'leonid-secret'
    };
    const body = xmlContent;
    const credentials = 'omit'; // или 'include' если используешь куки (тут не требуется)
  
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