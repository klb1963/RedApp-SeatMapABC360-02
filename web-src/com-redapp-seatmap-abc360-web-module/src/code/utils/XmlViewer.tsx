// file: /code/utils/XmlViewer.tsx

/**
 * XmlViewer.tsx
 *
 * 📄 React component for displaying a formatted XML document.
 * Also includes a button to download the content as a .xml file.
 */

import * as React from 'react';

/**
 * Formats raw XML into a readable indented format.
 *
 * @param xml - Raw XML string
 * @returns Formatted XML string with indentation
 */
const formatXml = (xml: string): string => {
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let formatted = '';
  let pad = 0;

  // Insert newline between tag boundaries
  xml = xml.replace(reg, '$1\r\n$2$3');

  // Process line by line
  xml.split('\r\n').forEach((node) => {
    let indent = 0;

    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0; // Self-contained tag
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 1; // Closing tag
    } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
      indent = 1; // Opening tag
    }

    const padding = PADDING.repeat(pad);
    formatted += padding + node + '\r\n';
    pad += indent;
  });

  return formatted.trim();
};

/**
 * Props for the XmlViewer component
 */
interface XmlViewerProps {
  xml: string;
}

/**
 * XmlViewer — renders formatted XML with a download button.
 */
export const XmlViewer: React.FC<XmlViewerProps> = ({ xml }) => {
  if (!xml || typeof xml !== 'string' || xml.trim().length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        ❌ XML document is missing or empty.
      </div>
    );
  }

  const formattedXml = formatXml(xml);

  /**
   * 💾 Downloads the currently formatted XML as a .xml file
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
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      {/* 📥 Download button */}
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button onClick={downloadXml} className="btn btn-primary">
          📥 Download XML
        </button>
      </div>

      {/* 🖥️ Formatted XML display */}
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          overflowX: 'auto'
        }}
      >
        {formattedXml}
      </pre>
    </div>
  );
};