// file: /code/components/pnrServices/createPnrForm.ts

import * as React from 'react';
import { CustomForm } from 'sabre-ngv-custom-forms/interfaces/form/CustomForm';
import { ICustomFormsService } from 'sabre-ngv-custom-forms/services/ICustomFormsService';
import { CustomFormRs } from 'sabre-ngv-custom-forms/interfaces/form/CustomFormRs';
import { TextField } from 'sabre-ngv-custom-forms/interfaces/form/fields/TextField';
import { DatesService } from 'sabre-ngv-app/app/services/impl/DatesService';
import { CommandMessageBasicRs } from 'sabre-ngv-pos-cdm/commsg';
import { ICommandMessageService } from 'sabre-ngv-commsg/services/ICommandMessageService';
import { InterstitialService } from 'sabre-ngv-app/app/services/impl/InterstitialService';

import { getService } from '../../../Context';
import { openCustomFormParagraph } from '../../../utils/openCustomFormParagraph';

export const createPnrForm = async (): Promise<void> => {
    const form: CustomForm = {
      title: 'Create PNR for LH410',
      fields: [
        { id: 'name1', value: '-KLEIMANN/LEONID MR' },
        { id: 'name2', value: '-KLIAIMAN/GALINA MRS' },
        { id: 'flight', value: '0LH410Y30JUNMUCFKHK2' },
        { id: 'ticket', value: '01Y2' },
        { id: 'agent', value: '6AGENT' },
        { id: 'phone', value: '91234567' },
        { id: 'timeLimit', value: '7TAW/' }
      ],
      actions: [
        { id: 'cancel', label: 'Cancel' },
        { id: 'ok', label: 'Submit' }
      ]
    };
  
    const result: CustomFormRs = await getService(ICustomFormsService).openForm(form);
    if (result.action === 'ok') {
      await selfSubmitPnrAction(result);
    }
  };
  
  const selfSubmitPnrAction = async (form: CustomForm): Promise<void> => {
    const interstitialService = getService(InterstitialService);
  
    const name1 = (form.fields.find(f => f.id === 'name1') as TextField).value;
    const name2 = (form.fields.find(f => f.id === 'name2') as TextField).value;
    const flightRq = (form.fields.find(f => f.id === 'flight') as TextField).value;
    const ticketRq = (form.fields.find(f => f.id === 'ticket') as TextField).value;
    const agentInfoRq = (form.fields.find(f => f.id === 'agent') as TextField).value;
    const phoneRq = (form.fields.find(f => f.id === 'phone') as TextField).value;
    const tawRq = (form.fields.find(f => f.id === 'timeLimit') as TextField).value;
  
    interstitialService.showInterstitial(15000);
  
    let success = await sendCommand(name1, 'Name1');
    success = success && await sendCommand(name2, 'Name2');
    success = success && await sendCommand(flightRq, 'Flight');
    success = success && await sendCommand(ticketRq, 'Ticket');
    success = success && await sendCommand(agentInfoRq, 'Agent');
    success = success && await sendCommand(phoneRq, 'Phone');
    success = success && await sendCommand(tawRq, 'Time Limit');
    success = success && await sendCommand('WP', 'Pricing');
    success = success && await sendCommand('PQ', 'Price Quote');
    success = success && await sendCommand('ER', 'End Record');
  
    interstitialService.hideInterstitial();
  
    if (success) {
      openCustomFormParagraph('Create PNR', '✅ PNR created successfully');
    }
  };
  
  const sendCommand = async (command: string, failureSegment: string): Promise<boolean> => {
    const rs: CommandMessageBasicRs = await getService(ICommandMessageService).send(command);
    const success = rs.Status?.Success;
  
    if (!success || rs.Status.Messages?.[0]?.Text.includes('SIGN IN')) {
      openCustomFormParagraph('Create PNR', `❌ ${failureSegment} creation failed`);
      return false;
    }
  
    return true;
  };