// file: /code/utils/XmlViewer.tsx

/**
 * XmlViewer.tsx
 *
 * 📄 React-компонент для отображения отформатированного XML-документа.
 * Также включает кнопку для скачивания содержимого как .xml файла.
 */

import * as React from 'react';

/**
 * Форматирует "сырой" XML в читаемый вид с отступами.
 *
 * @param xml - Строка XML-документа
 * @returns Форматированная строка
 */
const formatXml = (xml: string): string => {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;

    // Вставка перевода строки между тегами
    xml = xml.replace(reg, '$1\r\n$2$3');

    // Построчная обработка
    xml.split('\r\n').forEach((node) => {
        let indent = 0;

        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0; // Одинарный тег
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) pad -= 1; // Закрывающий тег
        } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
            indent = 1; // Открывающий тег
        }

        const padding = PADDING.repeat(pad);
        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted.trim();
};

/**
 * Props для компонента XmlViewer
 */
interface XmlViewerProps {
    xml: string;
}

/**
 * XmlViewer — отображает отформатированный XML + кнопку загрузки.
 */
export const XmlViewer: React.FC<XmlViewerProps> = ({ xml }) => {
    if (!xml || typeof xml !== 'string' || xml.trim().length === 0) {
        return (
            <div style={{ padding: '1rem', color: 'red' }}>
                ❌ XML-документ отсутствует или пуст.
            </div>
        );
    }

    const formattedXml = formatXml(xml);

    /**
     * 💾 Скачивание текущего форматированного XML в виде файла .xml
     */
    const downloadXml = () => {
        const blob = new Blob([formattedXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'soap-response.xml';
        a.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', maxHeight: '80vh', overflowY: 'auto' }}>
            {/* 📥 Кнопка скачивания */}
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <button onClick={downloadXml} className="btn btn-primary">
                    📥 Download XML
                </button>
            </div>

            {/* 🖥️ Отображение XML */}
            <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                overflowX: 'auto'
            }}>
                {formattedXml}
            </pre>
        </div>
    );
};