// файл: XmlViewer.tsx

import * as React from 'react';

const formatXml = (xml: string): string => {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;

    xml = xml.replace(reg, '$1\r\n$2$3');
    xml.split('\r\n').forEach((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        const padding = PADDING.repeat(pad);
        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted.trim();
};

interface XmlViewerProps {
    xml: string;
}

export const XmlViewer: React.FC<XmlViewerProps> = ({ xml }) => {
    if (!xml || typeof xml !== 'string' || xml.trim().length === 0) {
        return (
            <div style={{ padding: '1rem', color: 'red' }}>
                ❌ XML-документ отсутствует или пуст.
            </div>
        );
    }

    const formattedXml = formatXml(xml);

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
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <button onClick={downloadXml} className="btn btn-primary">
                    📥 Download XML
                </button>
            </div>
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