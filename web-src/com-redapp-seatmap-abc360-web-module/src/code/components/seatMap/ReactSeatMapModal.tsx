// file: /code/components/seatMap/ReactSeatMapModal.tsx

import * as React from 'react';
import Seatmap from './internal/Seatmap';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { enrichPassengerData } from './utils/enrichPassengerData';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import { convertSeatMapToReactSeatmapFormat } from '../../utils/convertSeatMapToReactSeatmap';

const ReactSeatMapModal: React.FC = () => {
  const [selectedSeatId, setSelectedSeatId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState([]);

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

      const { seatInfo } = await loadSeatMapFromSabre(firstSegment, enrichedPassengers);
      // console.log('✅ seatInfo from Sabre:', seatInfo);

      const reactSeatRows = convertSeatMapToReactSeatmapFormat(seatInfo);
      setRows(reactSeatRows);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>🧪 SEAT MAP TEST</h3>
      {selectedSeatId && (
        <p style={{ marginTop: '1rem' }}>
          🪑 Вы выбрали место: <strong>{selectedSeatId}</strong>
        </p>
      )}
      <Seatmap rows={rows} selectedSeatId={selectedSeatId} onSeatClick={setSelectedSeatId} />
    </div>
  );
};

export default ReactSeatMapModal;
