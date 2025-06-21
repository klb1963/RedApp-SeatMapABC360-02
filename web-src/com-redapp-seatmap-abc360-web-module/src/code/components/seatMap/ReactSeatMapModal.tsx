// file: /code/components/seatMap/ReactSeatMapModal.tsx

import * as React from 'react';
import Seatmap from './internal/Seatmap';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { enrichPassengerData } from './utils/enrichPassengerData';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import { convertSeatMapToReactSeatmapFormat } from '../../utils/convertSeatMapToReactSeatmap';
import DeckSelector from '../seatMap/internal/DeckSelector';

const ReactSeatMapModal: React.FC = () => {
  const [selectedSeatId, setSelectedSeatId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState([]);
  const [layoutLength, setLayoutLength] = React.useState(0);
  const [selectedDeck, setSelectedDeck] = React.useState('Maindeck');
  const filteredRows = rows.filter((row: any) => row.deckId === selectedDeck);

    React.useEffect(() => {
        const fetchData = async () => {
            const { parsedData: pnrData } = await loadPnrDetailsFromSabre();
            const segments = pnrData.segments;
            const passengers = pnrData.passengers;

            const enriched = enrichPassengerData(passengers);
            const enrichedPassengers = enriched.enrichedPassengers;

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
            // console.log('✅ seatInfo from Sabre:', seatInfo);

            const { rows, layoutLength } = convertSeatMapToReactSeatmapFormat(seatInfo, layoutLetters);
            setRows(rows);
            setLayoutLength(layoutLength);

            // console.log('✅ ReactSeatRows with AISLE:', reactSeatRows);

        };

        fetchData();
    }, []);

    const decks = Array.from(new Set(rows.map(row => row.deckId || 'Maindeck')));

    return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>💺 Seatmap React</h3>
      
          {/* 🔀 Переключатель палуб — показываем только если больше одной */}
            {decks.length > 1 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <DeckSelector
                        decks={decks}
                        selectedDeck={selectedDeck}
                        onChange={setSelectedDeck}
                    />
                </div>
            )}
      
          {/* 🪑 Выбранное место */}
          {selectedSeatId && (
            <p style={{ marginBottom: '1rem' }}>
              🪑 Вы выбрали место: <strong>{selectedSeatId}</strong>
            </p>
          )}
      
          {/* 💺 Сама схема */}
          <div style={{ display: 'inline-block' }}>
            <Seatmap
              rows={filteredRows}
              selectedSeatId={selectedSeatId}
              onSeatClick={setSelectedSeatId}
              layoutLength={layoutLength}
            />
          </div>
        </div>
      );

};

export default ReactSeatMapModal;
