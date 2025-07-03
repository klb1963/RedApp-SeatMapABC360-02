// file: /code/components/seatMap/internal/FallbackSeatmapCenter.tsx

import * as React from 'react';
import Seatmap from './Seatmap';
import DeckSelector from './DeckSelector';
import { createSelectedSeat } from '../helpers/createSelectedSeat';

export interface FallbackSeatmapCenterProps {
    passengers: any[];
    selectedPassengerId: string;
    selectedSeats: any[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<any[]>>;
    setSelectedPassengerId: (id: string) => void;
    rows: any[];
    layoutLength: number;
    selectedDeck: string;
    setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
}

const FallbackSeatmapCenter: React.FC<FallbackSeatmapCenterProps> = ({
    passengers,
    selectedPassengerId,
    selectedSeats,
    setSelectedSeats,
    setSelectedPassengerId,
    rows,
    layoutLength,
    selectedDeck,
    setSelectedDeck,
}) => {
    const [selectedSeatId, setSelectedSeatId] = React.useState<string | null>(null);

    const filteredRows = rows.filter((row: any) => row.deckId === selectedDeck);

    const decks = React.useMemo(
        () => Array.from(new Set(rows.map(row => row.deckId || 'Maindeck'))),
        [rows]
    );

    const handleSeatClick = (seatId: string) => {
        console.log('🟢 Clicked seat:', seatId);

        const pax = passengers.find(p => p.id === selectedPassengerId);
        if (!pax) return;

        const updated = selectedSeats.filter(s => s.passengerId !== pax.id);

        const seat = {
            passengerId: pax.id,
            seatLabel: seatId,
            confirmed: false,
            price: 0,
            passengerInitials: pax.passengerInitials,
            passengerColor: pax.passengerColor,
        };

        console.log('🧩 Created seat object:', seat);

        const newSelectedSeats = [...updated, seat];
        setSelectedSeats(newSelectedSeats);
        setSelectedSeatId(seatId);

        // 🔍 Найти следующего пассажира без места
        const assignedPassengerIds = newSelectedSeats.map(s => s.passengerId);
        const nextPax = passengers.find(
            p => !assignedPassengerIds.includes(p.id)
        );

        if (nextPax) {
            console.log(`➡️ Switching to next passenger: ${nextPax.id}`);
            setSelectedPassengerId(nextPax.id);
        } else {
            console.log('✅ All passengers have seats assigned.');
        }
    };

    const assignedMap = React.useMemo(() => {
        const map: Record<string, any> = {};
        for (const s of selectedSeats) {
            map[s.seatLabel] = s;
        }
        return map;
    }, [selectedSeats]);

    return (

        <div
            style={{
                flex: '1',
                paddingRight: '1rem',
                textAlign: 'center',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto'
            }}
        >
            <h3 style={{ marginBottom: '1rem' }}>Fallback Seatmap ABC 360</h3>

            {decks.length > 1 && (
                <div
                    style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
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

            <p
                style={{
                    marginTop: '1rem',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: '#666'
                }}
            >
                Deck: <strong>{selectedDeck}</strong>, rows:{' '}
                <strong>{filteredRows.length}</strong>
            </p>
        </div>

    );
};

export default FallbackSeatmapCenter;