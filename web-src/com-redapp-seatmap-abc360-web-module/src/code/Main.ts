import * as React from 'react';
import {Module} from 'sabre-ngv-core/modules/Module';
import { getService, registerService } from './Context';
import { ExtensionPointService } from 'sabre-ngv-xp/services/ExtensionPointService';

import {NoviceButtonConfig} from 'sabre-ngv-xp/configs/NoviceButtonConfig';
import { CustomWorkflowService } from './services/CustomWorkflowService';

import { RedAppSidePanelConfig } from 'sabre-ngv-xp/configs/RedAppSidePanelConfig';
import { RedAppSidePanelButton } from 'sabre-ngv-redAppSidePanel/models/RedAppSidePanelButton';

import { LayerService } from 'sabre-ngv-core/services/LayerService';

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
import { PricingView } from './components/views/SaetMapPricingView';

import { SampleComponent } from './views/SampleComponent';

import { CreatePNR } from './components/pnrServices/CreatePNR';

import { loadPnrDetailsFromSabre } from './services/loadPnrDetailsFromSabre';

import { loadSeatMapFromSabre } from './services/loadSeatMapFromSabre';

export class Main extends Module {
    init(): void {
        super.init();
        registerService(CustomWorkflowService);

         //делаем кнопку Command Helper Button
      const onClick = (isOpen: boolean) => {
        console.log('Command Helper Button onClick', isOpen);
        // insert logic here
      };
      const onClose = () => {
        console.log('Command Helper Popover onClose');
        // insert logic here
      };

      const config = new NoviceButtonConfig(
        // Define label for this button.
        'Sample button',
        // On top of text we add an icon from Font Awesome.
        'fa-comment',
        // Decorator is used to apply styles to the button that will be displayed in Command Helper Bar.
        'com-sabre-redapp-example3-web-command-helper-button-web-module',
        // Base React class to be mounted as root in ReactDOM.render().
        SampleComponent,
        // Priority of the button determines button position in the Command Helper Bar.
        0,
        onClick,
        onClose
      );

      // Add button configuration to add a command helper button.
      console.log('Adding Button config to ExtensionPointService...');
      getService(ExtensionPointService).addConfig('novice-buttons', config); // novice-buttons
      console.log('Button config added successfully.');

      // регистрация виджетов
      this.registerSeatMapAvailTile();
      this.registerSeatMapShoppingTile();

      // регистрация кнопок на правой панели
      const xp = getService(ExtensionPointService);

      const sidepanelMenu = new RedAppSidePanelConfig([
        new RedAppSidePanelButton(
          "Create PNR",
          "btn-secondary side-panel-button",
          () => { this.showForm(); },
          false
        ),

        new RedAppSidePanelButton(
          "SeatMaps ABC 360",
          "btn-secondary side-panel-button",
          () => { this.openSeatMapABC360(); },
          false
        ),

        new RedAppSidePanelButton(
          "Get EnhancedSeatMapRQ",
          "btn-secondary side-panel-button",
          () => { this.getEnhancedSeatMapRQ(); }, // 👈 новая кнопка
          false
        ),

        new RedAppSidePanelButton(
          "Show PNR Info",
          "btn-secondary side-panel-button",
          () => { this.showPnrInfo(); },
          false
        ),

      ]);

      xp.addConfig("redAppSidePanel", sidepanelMenu);

    } // end of init

  //============= форма для создания PNR =======
  showForm(): void {
    const ls = getService(LayerService);
    ls.showOnLayer(CreatePNR, { display: "areaView", position: 42 });
  }

  //============= открываем SeatMap ABC 360 =====
  
  openSeatMapABC360(): void {
    const publicModalsService = getService(PublicModalsService);
  
    publicModalsService.closeReactModal(); // ✅ Закрываем любые старые окна
  
    (async () => {
      try {
        const { parsedData: pnrData } = await loadPnrDetailsFromSabre();
  
        if (!pnrData || !pnrData.segments || pnrData.segments.length === 0) {
          publicModalsService.showReactModal({
            header: 'SeatMap ABC 360',
            component: React.createElement(
              'div',
              { style: { padding: '1rem' } },
              'No active PNR with flight segments.'
            ),
            modalClassName: 'seatmap-modal-class'
          });
          return;
        }

        // ✅ Берем первый сегмент
        const rawFlight = pnrData.segments[0];

        // ✅ Формируем объект flight в ожидаемом формате для библиотеки карты мест
        const flight = {
          ...rawFlight,
          flightNo: rawFlight.marketingFlightNumber || '000',
          flightNumber: rawFlight.marketingFlightNumber || '000',
          airlineCode: rawFlight.marketingCarrier || 'XX',
          origin: rawFlight.origin || 'XXX',
          destination: rawFlight.destination || 'YYY',
          departureDate: rawFlight.departureDate || '2025-01-01',
          cabinClass: rawFlight.bookingClass || 'Y',
          equipment: rawFlight.equipment || 'unknown',
          passengerType: 'ADT' // фиксированное значение, можно адаптировать
        };

        // ✅ Пассажиры из PNR
        const passengers = pnrData.passengers || [];

        // 🆕 Загружаем availability через EnhancedSeatMapRQ
        const { availability } = await loadSeatMapFromSabre(flight, passengers);

        // ✅ Логи
        console.log('✈️ flight:', flight);
        console.log('🧑‍✈️ passengers:', passengers);
        console.log('🪑 availability:', availability);

        // // ✅ Отладочный блок вместо настоящего компонента
        // publicModalsService.showReactModal({
        //   header: 'Seat Map ABC 360',
        //   component: React.createElement(
        //     'div',
        //     { style: { padding: '1rem', fontSize: '1.2rem', color: 'green' } },
        //     '🧪 Компонент успешно вызван!'
        //   ),
        //   modalClassName: 'seatmap-modal-class'
        // });

        // ✅ Показываем окно с компонентом карты мест
        // ✅ Показываем окно с компонентом карты мест
        publicModalsService.showReactModal({
          header: 'Seat Map ABC 360',
          component: React.createElement(
            require('./components/seatMap/SeatMapComponentPnr').default,
            {
              config: quicketConfig,
              flight,
              availability,
              passengers
            }
          ),
          modalClassName: 'seatmap-modal-class'
        });

      } catch (error) {
        console.error('❌ Failed to load PNR for seat maps:', error);

        publicModalsService.showReactModal({
          header: 'SeatMaps Error',
          component: React.createElement(
            'div',
            { style: { padding: '1rem', color: 'red' } },
            'Failed to load PNR data.'
          ),
          modalClassName: 'seatmap-modal-class'
        });
      }
    })();
  }


  //============= getEnhancedSeatMapRQ ==========
  private getEnhancedSeatMapRQ(): void {
    const publicModalsService = getService(PublicModalsService);

    publicModalsService.showReactModal({
      header: 'Get EnhancedSeatMapRQ',
      component: React.createElement(require('./components/EnhancedSeatMapRequest').EnhancedSeatMapRequest),
      modalClassName: 'seatmap-xml-modal'
    });
  }

  // =========== showPnrInfo ==================
  showPnrInfo(): void {
    const publicModalsService = getService(PublicModalsService);

    (async () => {
      try {
        const { parsedData: pnrData, rawXml } = await loadPnrDetailsFromSabre();

        const isEmpty =
          !pnrData ||
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
          component: React.createElement(
            'div',
            { style: { padding: '1rem', color: 'red' } },
            'Failed to load PNR data.'
          ),
          modalClassName: 'seatmap-modal-class',
        });
      }
    })();
  }

  //============== Widgets ====================

  // AvailabilityTile
  private registerSeatMapAvailTile(): void {
    const airAvailabilityService = getService(PublicAirAvailabilityService);

    const showSeatMapAvailabilityModal = (data: any) => {

      // console.log('📥 [Availability] Received Data:', JSON.stringify(data, null, 2));

      const modalOptions: ReactModalOptions = {
        header: 'SeatMaps ABC 360',
        component: React.createElement(SeatMapComponentAvail, {
          config: quicketConfig,
          data: data
        }),
        modalClassName: 'react-tile-modal-class'
      };
      getService(PublicModalsService).showReactModal(modalOptions);
    };

    airAvailabilityService.createAirAvailabilitySearchTile(
      SeatMapAvailTile,
      showSeatMapAvailabilityModal,
      'SeatMaps ABC 360'
    );
  }

    // Shopping & Pricing Tile 
    private registerSeatMapShoppingTile(): void {
        // определяем config shoppingDrawerConfig для Shopping
        
        console.log("registerSeatMapShoppingTile");

        const shoppingDrawerConfig = new LargeWidgetDrawerConfig(SeatMapShoppingTile, SeatMapShoppingView, {
            title: 'Shopping Tile Widget' // заголовок окна
        });
        // вызвываем сервис с этим config shoppingDrawerConfig
        getService(DrawerService).addConfig(['shopping-flight-segment'], shoppingDrawerConfig);

        // Pricing Tile
        const showPricingModal = this.createShowModalAction(PricingView, 'Pricing data');
        getService(IAirPricingService).createPricingTile(PricingTile, showPricingModal, 'ABC Seat Map');

    }

    // ===============================================
    // приватный метод для показа модального окна
    private createShowModalAction(view: React.FunctionComponent<any>, header: string): (data: any) => void {
        return ((data) => {
    
            console.log('📥 [Pricing] Received:', JSON.stringify(data, null, 2));
    
          const ngvModalOptions: ReactModalOptions = {
            header,
            component: React.createElement(
              view,
              data
            ),
            modalClassName: 'react-tile-modal-class'
          }
          getService(PublicModalsService).showReactModal(ngvModalOptions);
        })
      }

}
