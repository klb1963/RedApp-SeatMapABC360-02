import { CustomCommandHandler } from 'sabre-ngv-customCommand/interfaces/CustomCommandHandler';
import { CustomCommandRq } from 'sabre-ngv-customCommand/domain/CustomCommandRq';
import { CustomCommandRs } from 'sabre-ngv-customCommand/domain/CustomCommandRs';
import { getService } from '../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import * as React from 'react';
import SeatMapComponentPnr from '../components/seatMap/SeatMapComponentPnr';
import { quicketConfig } from '../utils/quicketConfig';

import {ICustomFormsService} from 'sabre-ngv-custom-forms/services/ICustomFormsService';

export class SeatMapABC360CommandHandler extends CustomCommandHandler {
    static SERVICE_NAME = 'com-redapp-seatmap-abc360-web-module-SeatMapABC360Handler';

    // This method is marked as async (it is not required)
    // It can be marked this way because it returns Promise
    // Due to async we are able to use await
    async onCommandSend(rq: CustomCommandRq): Promise<CustomCommandRs> {
        // Simple modal showing Custom Command Request
        await getService(ICustomFormsService).openForm({
            title: 'TEST MY Command Handler',
            fields: [
                {
                    id: 'command',
                    type: 'PARAGRAPH',
                    text: `**Command**: ${rq.command}`
                },
                {
                    id: 'parameter',
                    type: 'PARAGRAPH',
                    text: `**Parameter**: ${rq.parameter}`
                }
            ]
        });

        // We return empty object
        // Due to async Promise is being created automatically
        return;
    }
}