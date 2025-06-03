// file: /code/components/seatMap/tiles/SeatMapShoppingView.ts

/**
 * SeatMapShoppingView.ts
 * 
 * 🛍️ SeatMap View for Shopping Tile – RedApp ABC360
 * 
 * This class-based view integrates with the Sabre Red 360 shopping drawer workflow.
 * It receives a `FlightSegment`, extracts relevant flight data (including aircraft and dates),
 * then renders a React-based SeatMap view using `SeatMapComponentShopping`.
 * 
 * The SeatMap is mounted into a DOM node with ID `seatmap-root`, declared in the template.
 */

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

    /**
     * Triggered when the shopping context is propagated to this view.
     * Stores the received segment and renders the seat map component.
     */
    selfDrawerContextModelPropagated(cpa: FlightSegment): void {
        console.log('📌 [SeatMapShoppingView] selfDrawerContextModelPropagated called with cpa:', cpa);

        this.currentSegment = cpa;
        this.updateFlightSegmentsFromSegment(cpa);

        // 🧼 Clean up the container in case of re-render
        const rootElement = document.getElementById('seatmap-root');
        if (rootElement) {
            rootElement.innerHTML = '';
        }

        // ⏱ Retry rendering via React when DOM is ready
        this.tryRenderReactComponent();
    }
    
    /**
     * Optionally trigger rendering for a segment programmatically.
     */
    private renderForSegment(segment: FlightSegment): void {
        this.currentSegment = segment;
        this.updateFlightSegmentsFromSegment(segment);
        this.tryRenderReactComponent();
    }

    /**
     * Converts Sabre FlightSegment objects into simplified structure for React rendering.
     * Adds aircraft decoding for user-friendly display.
     */
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
            const equipmentCode = s.getEquipmentCode?.() || 'UNKNOWN';

            return {
                id: s.getSegmentId(),
                segmentId: s.getSegmentId(),
                flightNumber: s.getFlightNumber(),
                origin: s.getOriginIata(),
                destination: s.getDestinationIata(),
                airMiles: s.getAirMiles(),
                departureDateTime: s.getDepartureDate()?.toISOString().split('T')[0] || 'UNKNOWN',
                marketingAirline: s.getMarketingAirline(),
                cabinClass: 'A',
                equipment: {
                    EncodeDecodeElement: {
                        SimplyDecoded: aircraftTypes[equipmentCode] || 'Not Available'
                    }
                }
            };
        });
    }

    /**
     * Retry logic: attempts to render the React component if the container is not ready yet.
     */
    private tryRenderReactComponent(attempts = 0): void {
        const MAX_ATTEMPTS = 10;
        const INTERVAL = 500;
        const rootElement = document.getElementById('seatmap-root');

        if (rootElement) {
            console.log('✅ [SeatMapShoppingView] Found seatmap-root. Rendering React.');
            this.renderReactComponent();
        } else if (attempts < MAX_ATTEMPTS) {
            console.warn(`⚠️ [SeatMapShoppingView] seatmap-root not found. Retry #${attempts + 1}`);
            setTimeout(() => this.tryRenderReactComponent(attempts + 1), INTERVAL);
        } else {
            console.error('❌ [SeatMapShoppingView] Could not find seatmap-root after max attempts.');
        }
    }

    /**
     * Mounts the React seat map component into the DOM with prepared data.
     * Also stores flightSegments in sessionStorage for later reuse (e.g., in Pricing).
     */
    private renderReactComponent(): void {
        if (!this.currentSegment || !this.flightSegments?.length) return;
    
        const rootElement = document.getElementById('seatmap-root');
        if (!rootElement) {
            console.error('❌ seatmap-root not found in DOM');
            return;
        }
    
        rootElement.innerHTML = '';
    
        try {
            sessionStorage.setItem('flightSegmentsForPricing', JSON.stringify(this.flightSegments));
            console.log('💾 Flight segments saved to sessionStorage');
        } catch (err) {
            console.error('❌ Failed to save segments to sessionStorage:', err);
        }
    
        ReactDOM.render(
            <SeatMapComponentShopping
                config={quicketConfig}
                flightSegments={this.flightSegments}
                selectedSegmentIndex={this.selectedSegmentIndex}
            />,
            rootElement
        );
    
        console.log('📌 [SeatMapShoppingView] React component rendered');
    }
}