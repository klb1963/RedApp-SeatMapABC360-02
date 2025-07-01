// file: /code/components/seatMap/ReactSeatMapModal.tsx

import * as React from 'react';
import Seatmap from './internal/Seatmap';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { enrichPassengerData } from './utils/enrichPassengerData';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import { convertSeatMapToReactSeatmapFormat } from '../../utils/convertSeatMapToReactSeatmap';
import DeckSelector from '../seatMap/internal/DeckSelector';
import { createSelectedSeat } from './helpers/createSelectedSeat';

const ReactSeatMapModal: React.FC = () => {
    const [selectedSeatId, setSelectedSeatId] = React.useState<string | null>(null);
    const [rows, setRows] = React.useState([]);
    const [layoutLength, setLayoutLength] = React.useState(0);
    const [selectedDeck, setSelectedDeck] = React.useState('');
    const [passengers, setPassengers] = React.useState<any[]>([]);
    const [selectedPassengerId, setSelectedPassengerId] = React.useState<string>('');
    const [selectedSeats, setSelectedSeats] = React.useState<any[]>([]);

    const filteredRows = rows.filter((row: any) => row.deckId === selectedDeck);

    React.useEffect(() => {
        const fetchData = async () => {
            const { parsedData: pnrData } = await loadPnrDetailsFromSabre();
            const segments = pnrData.segments;
            const enriched = enrichPassengerData(pnrData.passengers);
            const enrichedPassengers = enriched.enrichedPassengers;

            setPassengers(enrichedPassengers);
            setSelectedPassengerId(enrichedPassengers[0]?.id || '');

            const firstSegment = {
                bookingClass: segments[0].bookingClass || 'Y',
                marketingCarrier: segments[0].marketingCarrier || 'XX',
                marketingFlightNumber: segments[0].marketingFlightNumber || '000',
                flightNumber: segments[0].marketingFlightNumber || '000',
                departureDate: segments[0].departureDate,
                origin: segments[0].origin,
                destination: segments[0].destination,
            };

            const { seatInfo, layoutLetters } = await loadSeatMapFromSabre(firstSegment, enrichedPassengers);
            const { rows, layoutLength } = convertSeatMapToReactSeatmapFormat(seatInfo, layoutLetters);
            setRows(rows);
            setLayoutLength(layoutLength);
        };

        fetchData();
    }, []);

    React.useEffect(() => {
        if (rows.length > 0 && !selectedDeck) {
            setSelectedDeck(rows[0].deckId || 'Maindeck');
        }
    }, [rows]);

    const decks = Array.from(new Set(rows.map(row => row.deckId || 'Maindeck')));

    const handleSeatClick = (seatId: string) => {
        const pax = passengers.find(p => p.id === selectedPassengerId);
        if (!pax) return;

        const updated = selectedSeats.filter(s => s.passengerId !== pax.id);

        setSelectedSeats([
            ...updated,
            createSelectedSeat(pax, seatId, false, [])
        ]);

        setSelectedSeatId(seatId);
    };

    const assignedMap = React.useMemo(() => {
        const map: Record<string, any> = {};
        for (const s of selectedSeats) {
            map[s.seatLabel] = s;
        }
        return map;
    }, [selectedSeats]);

    return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem' }}> Fallback Seatmap </h3>

            {decks.length > 1 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <DeckSelector
                        decks={decks}
                        selectedDeck={selectedDeck}
                        onChange={setSelectedDeck}
                    />
                </div>
            )}

            {selectedSeatId && (
                <p style={{ marginBottom: '1rem' }}>
                    🪑 Вы выбрали место: <strong>{selectedSeatId}</strong>
                </p>
            )}

            <div style={{ display: 'inline-block' }}>
                <Seatmap
                    rows={filteredRows}
                    selectedSeatId={selectedSeatId}
                    selectedSeatsMap={assignedMap}
                    onSeatClick={handleSeatClick}
                    layoutLength={layoutLength}
                />
            </div>

            <p style={{ marginTop: '1rem', textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                Deck: <strong>{selectedDeck}</strong>, rows: <strong>{filteredRows.length}</strong>
            </p>
        </div>
    );
};

export default ReactSeatMapModal;