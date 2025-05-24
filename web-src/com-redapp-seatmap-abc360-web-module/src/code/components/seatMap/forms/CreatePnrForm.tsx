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
  const tenDaysAheadFlight = '1' +
    getService(DatesService).getNow().add(10, 'days').format('DDMMM').toUpperCase() +
    'LASLAX\u00A5AA';

  const form: CustomForm = {
    title: 'Create PNR',
    fields: [
      { id: 'name', value: '-DOE/JOHN' },
      { id: 'flight', value: tenDaysAheadFlight },
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

  const nameRq: string = (form.fields.find(f => f.id === 'name') as TextField).value;
  const flightRq: string = (form.fields.find(f => f.id === 'flight') as TextField).value;
  const ticketRq: string = (form.fields.find(f => f.id === 'ticket') as TextField).value;
  const agentInfoRq: string = (form.fields.find(f => f.id === 'agent') as TextField).value;
  const phoneRq: string = (form.fields.find(f => f.id === 'phone') as TextField).value;
  const tawRq: string = (form.fields.find(f => f.id === 'timeLimit') as TextField).value;

  interstitialService.showInterstitial(15000);

  const nameRs = await sendCommand(nameRq, 'Name');
  const flightRs = nameRs && await sendCommand(flightRq, 'Flight');
  const ticketRs = flightRs && await sendCommand(ticketRq, 'Ticket');
  const agentRs = ticketRs && await sendCommand(agentInfoRq, 'Agent');
  const phoneRs = agentRs && await sendCommand(phoneRq, 'Phone');
  const tawRs = phoneRs && await sendCommand(tawRq, 'Time Limit');
  const wpRs = tawRs && await sendCommand('WP', 'Pricing');
  const pqRs = wpRs && await sendCommand('PQ', 'Price Quote');

  interstitialService.hideInterstitial();

  if (pqRs) {
    openCustomFormParagraph('Create PNR', 'PNR created');
  }
};

const sendCommand = async (command: string, failureSegment: string): Promise<boolean> => {
  const rs: CommandMessageBasicRs = await getService(ICommandMessageService).send(command);
  const success = rs.Status?.Success;

  if (!success || rs.Status.Messages?.[0]?.Text.includes('SIGN IN')) {
    openCustomFormParagraph('Create PNR', `${failureSegment} creation failed`);
    return false;
  }

  return true;
};