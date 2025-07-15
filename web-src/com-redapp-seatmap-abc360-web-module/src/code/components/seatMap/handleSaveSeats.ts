// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SeatAssignment } from './types/SeatAssigment';

/**
 * 🔄 handleSaveSeats
 *
 * Saves selected seat assignments for all segments.
 * Sends one AirSeatRQ per segment (with all passengers for that segment).
 *
 *  @param selectedSeats array of SeatAssignment objects for all passengers & all segments
 */
export const handleSaveSeats = async (
    selectedSeats: SeatAssignment[],
): Promise<void> => {
    const soap = getService(ISoapApiService);
    const pnrService = getService(PnrPublicService);
    const modalService = getService(PublicModalsService);

    const recordLocator = pnrService.getRecordLocator();
    if (!recordLocator) {
        console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
        throw new Error('No active PNR');
    }

    try {
        const { parsedData } = await loadPnrDetailsFromSabre();
        const passengers = parsedData.passengers || [];

        if (!selectedSeats.length) {
            console.warn(`⚠️ No selected seats to save`);
            alert(`⚠️ No selected seats to save`);
            return;
        }

        console.log(`📋 Preparing to save ${selectedSeats.length} seat assignments across all segments…`);

        // 👇 Группировка мест по сегментам
        const segmentsMap = new Map<string, SeatAssignment[]>();

        for (const seat of selectedSeats) {
            if (!segmentsMap.has(seat.segmentNumber)) {
                segmentsMap.set(seat.segmentNumber, []);
            }
            segmentsMap.get(seat.segmentNumber)!.push(seat);
        }

        for (const [segmentNumber, seatsForSegment] of Array.from(segmentsMap.entries())) {
            const nameNumbers = new Set<string>();
            const seatNumbers = new Set<string>();

            for (const seat of seatsForSegment) {
                const pax = passengers.find(
                    p => p.id === seat.passengerId || p.nameNumber === seat.passengerId
                );
                if (!pax || !pax.nameNumber || !seat.seatLabel) {
                    console.warn(`⚠️ Skipping invalid seat assignment: passenger=${seat.passengerId}, seat=${seat.seatLabel}, segment=${segmentNumber}`);
                    continue;
                }

                nameNumbers.add(pax.nameNumber);
                seatNumbers.add(seat.seatLabel);
            }

            if (!nameNumbers.size || !seatNumbers.size) {
                console.warn(`⚠️ No valid passengers/seats for segment ${segmentNumber}`);
                continue;
            }

            const xml = `
            <AirSeatRQ Version="2.1.2"
              xmlns="http://webservices.sabre.com/sabreXML/2011/10"
              xmlns:xs="http://www.w3.org/2001/XMLSchema"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
              <Seats>
                <Seat>
                  ${Array.from(nameNumbers).map(n => `<NameSelect NameNumber="${n}"/>`).join('\n')}
                  ${Array.from(seatNumbers).map(s => `<SeatSelect Number="${s}"/>`).join('\n')}
                  <SegmentSelect Number="${segmentNumber}"/>
                </Seat>
              </Seats>
            </AirSeatRQ>`.trim();

            console.log(`📤 Sending AirSeatRQ for segment ${segmentNumber}:\n`, xml);

            const response = await soap.callSws({
                action: 'AirSeatLLSRQ',
                payload: xml,
                authTokenType: 'SESSION',
            });

            console.log(`📩 Response for segment ${segmentNumber}:\n`, response.value);

            if (response.value.includes('<Error')) {
                console.warn(`⚠️ Error in Sabre response for segment ${segmentNumber}:\n`, response.value);
                alert(`❌ Error assigning seats for segment ${segmentNumber}. See console for details.`);
            } else {
                console.log(`✅ Seats assigned for segment ${segmentNumber}.`);
            }
        }

        await pnrService.refreshData();
        modalService.closeReactModal();

        console.log('✅ All seats successfully assigned on all segments.');

    } catch (error) {
        console.error('❌ Error sending AirSeatRQ:', error);
        alert('❌ Error assigning seats (AirSeatRQ). See console.');
    }
};