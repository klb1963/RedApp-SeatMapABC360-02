// file: code/Main.ts

// file: code/Main.ts

import * as React from 'react';
import { Module } from 'sabre-ngv-core/modules/Module';
import { getService, registerService } from './Context';
import { ExtensionPointService } from 'sabre-ngv-xp/services/ExtensionPointService';

import { NoviceButtonConfig } from 'sabre-ngv-xp/configs/NoviceButtonConfig';
import { CustomWorkflowService } from './services/CustomWorkflowService';

import { RedAppSidePanelConfig } from 'sabre-ngv-xp/configs/RedAppSidePanelConfig';
import { RedAppSidePanelButton } from 'sabre-ngv-redAppSidePanel/models/RedAppSidePanelButton';

import { PublicAirAvailabilityService } from 'sabre-ngv-airAvailability/services/PublicAirAvailabilityService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { ReactModalOptions } from 'sabre-ngv-modals/components/PublicReactModal/ReactModalOptions';

import { DrawerService } from 'sabre-ngv-app/app/services/impl/DrawerService';
import { LargeWidgetDrawerConfig } from 'sabre-ngv-core/configs/drawer/LargeWidgetDrawerConfig';
import { IAirPricingService } from 'sabre-ngv-pricing/services/IAirPricingService';

import { SeatMapAvailTile } from './components/tiles/SeatMapAvailTile';
import { quicketConfig } from './utils/quicketConfig';
import SeatMapComponentAvail from './components/seatMap/SeatMapComponentAvail';
import { SeatMapShoppingTile } from './components/tiles/SeatMapShoppingTile';
import { SeatMapShoppingView } from './components/views/SeatMapShoppingView';
import { PricingTile } from './components/tiles/SeatMapPricingTile';
import { PricingView } from './components/views/SeatMapPricingView';

import { SampleComponent } from './views/SampleComponent';

import { loadPnrDetailsFromSabre } from './services/loadPnrDetailsFromSabre';
import { openSeatMapPnr } from './components/seatMap/openSeatMapPnr';
import { AgentProfileService } from 'sabre-ngv-app/app/services/impl/AgentProfileService';
import ShowAgentProfile from './services/ShowAgentProfile';

import { createPnrForm } from './components/seatMap/forms/CreatePnrForm';

import { SeatMapABC360CommandHandler } from './services/SeatMapABC360Handler';
import { SeatMapABC360PnrHandler } from './services/SeatMapABC360PnrHandler';

import { t } from './Context';

export class Main extends Module {
  init(): void {
    super.init();
    registerService(CustomWorkflowService);
    registerService(SeatMapABC360CommandHandler);
    registerService(SeatMapABC360PnrHandler);

    // Register Command Helper Button
    const onClick = (isOpen: boolean) => {
      console.log('Command Helper Button onClick', isOpen);
    };
    const onClose = () => {
      console.log('Command Helper Popover onClose');
    };

    const config = new NoviceButtonConfig(
      'Sample button',
      'fa-comment',
      'com-sabre-redapp-example3-web-command-helper-button-web-module',
      SampleComponent,
      0,
      onClick,
      onClose
    );

    console.log('Adding Button config to ExtensionPointService...');
    getService(ExtensionPointService).addConfig('novice-buttons', config);
    console.log('Button config added successfully.');

    // Register widgets and sidepanel buttons
    this.registerSeatMapAvailTile();
    this.registerSeatMapShoppingTile();

    const xp = getService(ExtensionPointService);

    const sidepanelMenu = new RedAppSidePanelConfig([
      new RedAppSidePanelButton('Create Test PNR', 'btn-secondary side-panel-button', () => this.showCreatePnrForm(), false),
      new RedAppSidePanelButton('SeatMap ABC 360', 'btn-secondary side-panel-button', () => this.openSeatMapABC360(), false),
      new RedAppSidePanelButton('Get EnhancedSeatMapRQ', 'btn-secondary side-panel-button', () => this.getEnhancedSeatMapRQ(), false),
      new RedAppSidePanelButton('Show PNR Info', 'btn-secondary side-panel-button', () => this.showPnrInfo(), false),
      new RedAppSidePanelButton('SeatMap ABC 360 Setup', 'btn-secondary side-panel-button', () => this.showAgentProfile(), false),
      new RedAppSidePanelButton('SeatMap Fallback', 'btn-secondary side-panel-button', () => this.showSeatMapReact(), false),
    ]);

    xp.addConfig('redAppSidePanel', sidepanelMenu);
  }

  private showCreatePnrForm(): void {
    createPnrForm();
  }

  private openSeatMapABC360(): void {
    getService(PublicModalsService).closeReactModal();
    openSeatMapPnr();
  }

  private showSeatMapReact(): void {
    getService(PublicModalsService).showReactModal({
      header: 'React Seat Map',
      component: React.createElement(require('./components/seatMap/ReactSeatMapModal').default),
      modalClassName: 'seatmap-modal-lower'
    });
  }

  private showAgentProfile = (): void => {
    const modals = getService(PublicModalsService);
    const agentService = getService(AgentProfileService);

    const agent = {
      agentId: agentService.getAgentId() || '—',
      pcc: agentService.getPcc() || '—',
      country: agentService.getCountry() || '—',
      region: agentService.getRegion() || '—',
      locale: agentService.getLocale() || '—',
      customerBusinessUnit: agentService.getCustomerBusinessUnit() || '—',
      customerEmployeeId: agentService.getCustomerEmployeeId() || '—'
    };

    const ref = React.createRef<{ save: () => void }>();

    modals.showReactModal({
      header: 'Seat Map ABC 360 Setup',
      component: React.createElement(ShowAgentProfile, { ref, agent }),
      actions: [
        React.createElement('button', { key: 'save', className: 'sabre-button-primary', onClick: () => { ref.current?.save(); modals.closeReactModal(); } }, 'Save'),
        React.createElement('button', { key: 'close', className: 'sabre-button-secondary', onClick: () => modals.closeReactModal() }, 'Close')
      ],
      modalClassName: 'seatmap-modal-class'
    });
  };

  localStore = {
    store: {
      getState: () => ({ selectedSeats: (window as any).selectedSeats || [] })
    }
  };

  private onClickCancel = () => {
    getService(PublicModalsService).closeReactModal();
  };

  private getEnhancedSeatMapRQ(): void {
    const publicModalsService = getService(PublicModalsService);

    publicModalsService.showReactModal({
      header: 'Get EnhancedSeatMapRQ',
      component: React.createElement(require('./tools/EnhancedSeatMapRequest').EnhancedSeatMapRequest),
      modalClassName: 'seatmap-xml-modal'
    });
  }

  showPnrInfo(): void {
    const publicModalsService = getService(PublicModalsService);

    (async () => {
      try {
        const { parsedData: pnrData, rawXml } = await loadPnrDetailsFromSabre();

        const isEmpty = !pnrData ||
          (Array.isArray(pnrData.passengers) && pnrData.passengers.length === 0) &&
          (Array.isArray(pnrData.segments) && pnrData.segments.length === 0);

        if (isEmpty) {
          publicModalsService.showReactModal({
            header: 'PNR Information',
            component: React.createElement('div', { style: { padding: '1rem' } }, 'No active PNR found.'),
            modalClassName: 'seatmap-modal-class',
          });
          return;
        }

        const ShowPnrInfoComponent = require('./components/pnrServices/ShowPnrInfo').ShowPnrInfo;

        publicModalsService.showReactModal({
          header: 'PNR Information',
          component: React.createElement(ShowPnrInfoComponent, { pnrData, rawXml }),
          modalClassName: 'seatmap-modal-class',
        });
      } catch (error) {
        console.error('❌ Failed to load PNR data:', error);
        publicModalsService.showReactModal({
          header: 'PNR Error',
          component: React.createElement('div', { style: { padding: '1rem', color: 'red' } }, t('seatMap.loadPnrError')),
          modalClassName: 'seatmap-modal-class'
        });
      }
    })();
  }

  private registerSeatMapAvailTile(): void {
    const airAvailabilityService = getService(PublicAirAvailabilityService);

    const showSeatMapAvailabilityModal = (data: any) => {
      const modalOptions: ReactModalOptions = {
        header: 'SeatMaps ABC 360',
        component: React.createElement(SeatMapComponentAvail, {
          config: quicketConfig,
          data
        }),
        modalClassName: 'seatmap-modal-lower'
      };

      getService(PublicModalsService).showReactModal(modalOptions);
    };

    airAvailabilityService.createAirAvailabilitySearchTile(
      SeatMapAvailTile,
      showSeatMapAvailabilityModal,
      'SeatMaps ABC 360'
    );
  }

  private registerSeatMapShoppingTile(): void {
    console.log("registerSeatMapShoppingTile");

    const shoppingDrawerConfig = new LargeWidgetDrawerConfig(SeatMapShoppingTile, SeatMapShoppingView, {
      title: 'Shopping Tile Widget',
    });
    getService(DrawerService).addConfig(['shopping-flight-segment'], shoppingDrawerConfig);

    const showPricingModal = this.createShowModalAction(PricingView, 'Pricing data');
    getService(IAirPricingService).createPricingTile(PricingTile, showPricingModal, 'ABC Seat Map');
  }

  private createShowModalAction(view: React.FunctionComponent<any>, header: string): (data: any) => void {
    return (data) => {
      console.log('📥 [Pricing] Received:', JSON.stringify(data, null, 2));

      const ngvModalOptions: ReactModalOptions = {
        header,
        component: React.createElement(view, data),
        modalClassName: 'seatmap-modal-lower'
      };
      getService(PublicModalsService).showReactModal(ngvModalOptions);
    };
  }
}
