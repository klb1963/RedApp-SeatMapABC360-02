import { CustomCommandHandler } from 'sabre-ngv-customCommand/interfaces/CustomCommandHandler';
import { CustomCommandRq } from 'sabre-ngv-customCommand/domain/CustomCommandRq';
import { CustomCommandRs } from 'sabre-ngv-customCommand/domain/CustomCommandRs';
import { getService } from '../Context';

import {ICustomFormsService} from 'sabre-ngv-custom-forms/services/ICustomFormsService';

import ReactSeatMapModal from '../components/seatMap/ReactSeatMapModal';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import * as React from 'react';

export class SeatMapABC360CommandHandler extends CustomCommandHandler {
    static SERVICE_NAME = 'com-redapp-seatmap-abc360-web-module-SeatMapABC360Handler';

    async onCommandSend(rq: CustomCommandRq): Promise<CustomCommandRs> {
        console.log('[SeatMapABC360] Command invoked: §123');
    
        const modals = getService(PublicModalsService);
    
        modals.showReactModal({
            header: 'Seat Map ABC 360 (Fallback)',
            component: React.createElement(ReactSeatMapModal, {}),
            modalClassName: 'seatmap-modal-lower'
        });
    
        return new CustomCommandRs();
    }

    // async onCommandSend(rq: CustomCommandRq): Promise<CustomCommandRs> {
    //     // Simple modal showing Custom Command Request
    //     await getService(ICustomFormsService).openForm({
    //         title: 'TEST MY Command Handler',
    //         fields: [
    //             {
    //                 id: 'command',
    //                 type: 'PARAGRAPH',
    //                 text: `**Command**: ${rq.command}`
    //             },
    //             {
    //                 id: 'parameter',
    //                 type: 'PARAGRAPH',
    //                 text: `**Parameter**: ${rq.parameter}`
    //             }
    //         ]
    //     });

    //     // We return empty object
    //     // Due to async Promise is being created automatically
    //     return;
    // }
}