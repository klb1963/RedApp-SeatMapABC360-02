// file: SeatMapShoppingView.ts

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AbstractView } from 'sabre-ngv-app/app/AbstractView';
import { AbstractModel } from 'sabre-ngv-app/app/AbstractModel';
import { FlightSegment } from 'sabre-ngv-app/app/common/data/flight/FlightSegment';
import SeatMapComponentShopping from '../seatMap/SeatMapComponentShopping';
import { quicketConfig } from '../../utils/quicketConfig';
import { CssClass } from 'sabre-ngv-core/decorators/classes/view/CssClass';
import { Template } from 'sabre-ngv-core/decorators/classes/view/Template';

@CssClass('com-redapp-seatmap-abc360-web-module')
@Template('com-redapp-seatmap-abc360-web-module:ShoppingTileView')
export class SeatMapShoppingView extends AbstractView<AbstractModel> {
    private currentSegment: FlightSegment | null = null;
    private flightSegments: any[] = [];
    private selectedSegmentIndex: number = 0;

    selfDrawerContextModelPropagated(cpa: FlightSegment): void {
        console.log('📌 [SeatMapShoppingView] selfDrawerContextModelPropagated called with cpa:', cpa);

        this.currentSegment = cpa;
        this.updateFlightSegmentsFromSegment(cpa);

        // 🧽 Очистка контейнера при повторном открытии
        const rootElement = document.getElementById('seatmap-root');
        if (rootElement) {
            rootElement.innerHTML = '';
        }

    // ⏱ Перерисовка через React
        this.tryRenderReactComponent();

    }
    
    // 🧠 Унифицированный метод для рендера компонента
    private renderForSegment(segment: FlightSegment): void {
        this.currentSegment = segment;
        this.updateFlightSegmentsFromSegment(segment);
        this.tryRenderReactComponent();
    }

    private updateFlightSegmentsFromSegment(segment: FlightSegment): void {
        const segments = segment.getShoppingItinerary().getFlightSegments();

        const aircraftTypes: Record<string, string> = {
            '359': 'Airbus A350-900',
            '388': 'Airbus A380-800',
            '77W': 'Boeing 777-300ER',
            '320': 'Airbus A320',
            '321': 'Airbus A321',
            '738': 'Boeing 737-800',
            '787': 'Boeing 787 Dreamliner'
        };

        this.flightSegments = segments.map(s => {
            const segmentId = s.getSegmentId();
            const flightNumber = s.getFlightNumber();
            const origin = s.getOriginIata();
            const destination = s.getDestinationIata();
            const airMiles = s.getAirMiles();
            const departureDate = s.getDepartureDate();
            const marketingAirline = s.getMarketingAirline();
            const equipmentCode = s.getEquipmentCode?.() || 'UNKNOWN';

            return {
                id: segmentId,
                segmentId,
                flightNumber,
                origin,
                destination,
                airMiles,
                departureDateTime: departureDate?.toISOString().split('T')[0] || 'UNKNOWN',
                marketingAirline,
                cabinClass: 'A',
                equipment: {
                    EncodeDecodeElement: {
                        SimplyDecoded: aircraftTypes[equipmentCode] || 'Not Available'
                    }
                }
            };
        });
    }

    private tryRenderReactComponent(attempts = 0): void {
        const MAX_ATTEMPTS = 10;
        const INTERVAL = 500;
        const rootElement = document.getElementById('seatmap-root');

        if (rootElement) {
            console.log('✅ [SeatMapShoppingView] Найден seatmap-root. Рендерим React.');
            this.renderReactComponent();
        } else if (attempts < MAX_ATTEMPTS) {
            console.warn(`⚠️ [SeatMapShoppingView] seatmap-root не найден. Попытка ${attempts + 1}`);
            setTimeout(() => this.tryRenderReactComponent(attempts + 1), INTERVAL);
        } else {
            console.error('❌ [SeatMapShoppingView] Не удалось найти seatmap-root.');
        }
    }

    private renderReactComponent(): void {
        if (!this.currentSegment || !this.flightSegments?.length) return;

        const rootElement = document.getElementById('seatmap-root');
        if (!rootElement) {
            console.error('❌ Не найден #seatmap-root в шаблоне');
            return;
        }

        rootElement.innerHTML = '';

        const data = {
            flightSegments: this.flightSegments,
            selectedSegmentIndex: this.selectedSegmentIndex
        };

        try {
            sessionStorage.setItem('flightSegmentsForPricing', JSON.stringify(this.flightSegments));
            console.log('💾 Сегменты сохранены в sessionStorage');
        } catch (err) {
            console.error('❌ Ошибка при сохранении в sessionStorage:', err);
        }

        ReactDOM.render(
            <SeatMapComponentShopping config={quicketConfig} data={data} />,
            rootElement
        );

        console.log('📌 [SeatMapShoppingView] React компонент отрендерен');
    }
}