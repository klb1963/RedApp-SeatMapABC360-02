import { CustomCommandHandler } from 'sabre-ngv-customCommand/interfaces/CustomCommandHandler';
import { CustomCommandRq } from 'sabre-ngv-customCommand/domain/CustomCommandRq';
import { CustomCommandRs } from 'sabre-ngv-customCommand/domain/CustomCommandRs';
import { openSeatMapPnr } from '../components/seatMap/openSeatMapPnr';

export class SeatMapABC360PnrHandler extends CustomCommandHandler {
    static SERVICE_NAME = 'com-redapp-seatmap-abc360-web-module-SeatMapABC360PnrHandler';

    async onCommandSend(rq: CustomCommandRq): Promise<CustomCommandRs> {
        console.log('[SeatMapABC360PNR] Command invoked: §360');
        await openSeatMapPnr();
        return;
    }
}