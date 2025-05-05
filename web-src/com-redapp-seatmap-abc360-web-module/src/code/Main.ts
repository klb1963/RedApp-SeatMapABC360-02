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

export class Main extends Module {
    init(): void {
        super.init();
        registerService(CustomWorkflowService);

        // регистрация виджетов
        this.registerSeatMapAvailTile();
        this.registerSeatMapShoppingTile();

        // регистрация кнопок на правой панели
        const xp = getService(ExtensionPointService);

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
