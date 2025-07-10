// file: code/components/pnrServices/ShowPnrInfo.tsx

/**
 * ShowPnrInfo.tsx
 * 
 * 📌 RedApp SeatMap ABC360 – PNR Viewer Component
 * 
 * 📋 React component for displaying PNR details:
 * - Passenger list with seat assignments and nameNumber
 * - Flight segments (origin, destination, carrier, flight, booking class)
 * - Raw XML display using <XmlViewer />
 *
 * 💾 Allows saving the retrieved PNR XML to a local file (via XmlViewer)
 *
 * Used after loading PNR data from Sabre through `loadPnrDetailsFromSabre()`.
 * Useful for debugging and analyzing PNR structure.
 */

import * as React from 'react';
import { XmlViewer } from '../../utils/XmlViewer'; // для отображения "сырого" XML

interface ShowPnrInfoProps {
    pnrData: any;
    rawXml?: string;
}

export const ShowPnrInfo: React.FC<ShowPnrInfoProps> = ({ pnrData, rawXml }) => {
    return (
        <div style={{ padding: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>🧳 Passenger List</h3>
            <ul>
                {pnrData.passengers.map((passenger: any, index: number) => {
                    const seatsForPassenger = (pnrData.assignedSeats || [])
                        .filter((s: any) => s.passengerId === passenger.id || s.passengerId === passenger.nameNumber);

                    return (
                        <li key={index}>
                            <strong>{passenger.surname}/{passenger.givenName}</strong>
                            {passenger.nameNumber && (
                                <span style={{ marginLeft: '1rem', color: '#999' }}>
                                    NameNumber: <code>{passenger.nameNumber}</code>
                                </span>
                            )}
                            <ul>
                                {seatsForPassenger.length > 0 ? (
                                    seatsForPassenger.map((seat: any, i: number) => {
                                        const seg = pnrData.segments.find((s: any) => s.segmentNumber === seat.segmentNumber);
                                        return (
                                            <li key={i} style={{ color: '#555' }}>
                                                Segment {seat.segmentNumber} ({seg?.origin} → {seg?.destination}): <strong>{seat.seat}</strong>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li style={{ color: '#999' }}>No seats assigned</li>
                                )}
                            </ul>
                        </li>
                    );
                })}
            </ul>

            {/* === ✈️ Segments === */}
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
                        <th style={thStyle}>Segment #</th>
                        <th style={thStyle}>Segment ID</th>
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
                            <td style={tdStyle}><strong>{segment.segmentNumber}</strong></td>
                            <td style={tdStyle}><code>{segment.value}</code></td>
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

// 🧾 CSS for table
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

export default ShowPnrInfo;