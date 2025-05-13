// file: code/components/ShowPnrInfo.tsx

import * as React from 'react';
import { XmlViewer } from '../../utils/XmlViewer'; // для отображения "сырого" XML

interface ShowPnrInfoProps {
    pnrData: any;
    rawXml?: string;
}

export const ShowPnrInfo: React.FC<ShowPnrInfoProps> = ({ pnrData, rawXml }) => {
    return (
        <div style={{ padding: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
            {/* === 🧳 ПАССАЖИРЫ === */}
            <h3>🧳 Passenger List</h3>
            <ul>
                {pnrData.passengers.map((passenger: any, index: number) => (
                    <li key={index}>
                        <strong>{passenger.surname}/{passenger.givenName}</strong>
                        {' — '}
                        <span style={{ color: '#555' }}>
                            Seat: <strong>{passenger.seatAssignment || 'not assigned'}</strong>
                        </span>
                        {passenger.nameNumber && (
                            <span style={{ marginLeft: '1rem', color: '#999' }}>
                                NameNumber: <code>{passenger.nameNumber}</code>
                            </span>
                        )}
                    </li>
                ))}
            </ul>

            {/* === ✈️ СЕГМЕНТЫ РЕЙСОВ === */}
            <h3 style={{ marginTop: '2rem' }}>✈️ FLIGHT SEGMENTS</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th style={thStyle}>From</th>
                        <th style={thStyle}>To</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Carrier</th>
                        <th style={thStyle}>Flight</th>
                        <th style={thStyle}>Class</th>
                        <th style={thStyle}>Equipment</th>
                    </tr>
                </thead>
                <tbody>
                    {pnrData.segments.map((segment: any, index: number) => (
                        <tr key={index}>
                            <td style={tdStyle}>{segment.origin}</td>
                            <td style={tdStyle}>{segment.destination}</td>
                            <td style={tdStyle}>{segment.departureDate}</td>
                            <td style={tdStyle}>{segment.marketingCarrier}</td>
                            <td style={tdStyle}>{segment.marketingFlightNumber}</td>
                            <td style={tdStyle}>{segment.bookingClass}</td>
                            <td style={tdStyle}>{segment.equipment}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* === 📦 RAW XML (если есть) === */}
            {rawXml && (
                <>
                    <h3 style={{ marginTop: '2rem' }}>🗂️ RAW PNR XML</h3>
                    <XmlViewer xml={rawXml} />
                </>
            )}
        </div>
    );
};

// 🧾 Стили для таблицы
const thStyle: React.CSSProperties = {
    borderBottom: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
};

const tdStyle: React.CSSProperties = {
    borderBottom: '1px solid #eee',
    padding: '8px',
};