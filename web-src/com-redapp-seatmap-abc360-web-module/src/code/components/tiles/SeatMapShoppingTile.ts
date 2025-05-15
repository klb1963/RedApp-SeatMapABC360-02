//file: /code/components/seatMap/tiles/SeatMapShoppingTile.ts

/**
 * SeatMapShoppingTile.ts
 * 
 * 🛍️ Custom Tile for Sabre Air Shopping Drawer – RedApp ABC360
 * 
 * This tile displays a SeatMap launch button inside the Air Shopping drawer.
 * It extracts segment info from the Shopping context (`FlightSegment`), stores it in
 * the SharedContextModel for use by other components (e.g. modal seat map viewer),
 * and renders a button UI to trigger the SeatMap manually.
 * 
 * Integrates with Sabre NGV SDK (Tile, Context, SharedContextModel).
 */

import { Tile } from 'sabre-ngv-app/app/widgets/drawer/views/elements/Tile';
import { TileOptions } from 'sabre-ngv-app/app/widgets/drawer/views/elements/TileOptions';
import { FlightSegment } from 'sabre-ngv-app/app/common/data/flight/FlightSegment';
import { WithoutFocusOnClick } from 'sabre-ngv-app/app/common/mixins/WithoutFocusOnClick';
import { Initial } from 'sabre-ngv-core/decorators/classes/Initial';
import { Mixin } from 'sabre-ngv-core/decorators/classes/Mixin';
import { CssClass } from 'sabre-ngv-core/decorators/classes/view/CssClass';
import { extractSegmentData } from '../../utils/extractSegmentData';

@CssClass('com-redapp-seatmapsabc360-01-web-module', { overwrite: false })
@Initial<TileOptions>({
    caption: 'SeatMaps ABC 360',
    className: 'web-air-shopping-widget-sample'
})
@Mixin(WithoutFocusOnClick)
export class SeatMapShoppingTile extends Tile<FlightSegment> implements WithoutFocusOnClick {
    declare context: any;

    private currentSegment: FlightSegment | null = null;
    private sharedModel: any = null;

    /**
     * Called when the drawer context is updated.
     * Receives the selected `FlightSegment` and renders the button tile UI.
     */
    selfDrawerContextModelPropagated(cpa: FlightSegment): void {
        console.log("selfDrawerContextModelPropagated");

        try {
            this.currentSegment = cpa;

            // 🧩 Extract segment data from FlightSegment (for use in pricing component)
            const sharedSegmentData = extractSegmentData(cpa);

            // 💾 Store segment in sharedContextModel if available
            if (this.context?.sharedContextModel?.set) {
                this.sharedModel = this.context.sharedContextModel;
                this.sharedModel.set('selectedSegmentForPricing', sharedSegmentData);
                console.log('✅ Segment saved to SharedContextModel:', sharedSegmentData);
            } else if (this.sharedModel?.set) {
                this.sharedModel.set('selectedSegmentForPricing', sharedSegmentData);
                console.log('♻️ Reused SharedContextModel:', sharedSegmentData);
            } else {
                console.warn('⚠️ SharedContextModel unavailable — segment not saved.');
            }

            // 🛫 Build a label based on all segments in the itinerary
            const segments = cpa.getShoppingItinerary().getFlightSegments();
            const label = segments.map(segment => {
                const origin = segment.getOriginIata();
                const destination = segment.getDestinationIata();
                const carrier = segment.getMarketingAirline();
                const flightNumber = segment.getFlightNumber();
                return `${origin}-${destination}:${carrier} ${flightNumber}`;
            }).join(' ');

            // 🧱 Generate HTML for the tile with a launch button
            const tileHtml = `
                <div style="display: flex; flex-direction: column; align-items: center; font-size: 12px;">
                    <div style="margin-bottom: 8px;">${label}</div>
                    <button class="abc-seatmap-button" style="
                        padding: 0px 12px 12px 12px;
                        background-color: #2f73bc;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;">
                        SeatMaps ABC 360
                    </button>
                </div>
            `;

            console.log("setDataContent_before");

            // 🚀 Render the HTML content inside the tile
            this.setDataContent(tileHtml);

            console.log("setDataContent_after");

        } catch (error) {
            console.error('❌ Error in selfDrawerContextModelPropagated:', error);
        }
    }

    /**
     * Invoked when the user changes fare selection.
     * Re-renders the tile with updated segment info.
     */
    selfSelectedFareChanged(cpa: FlightSegment): void {
        this.selfDrawerContextModelPropagated(cpa);
    }
}