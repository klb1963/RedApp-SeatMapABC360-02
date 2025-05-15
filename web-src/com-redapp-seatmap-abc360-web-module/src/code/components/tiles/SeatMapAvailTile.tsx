// file: /code/components/seatMap/tiles/SeatMapAvailTile.tsx

/**
 * SeatMapAvailTile.tsx
 * 
 * 🧩 Tile Component for Air Availability Panel – RedApp ABC360
 * 
 * This tile is rendered inside the Sabre Red 360 Air Availability workflow.
 * It displays basic information about flight segments and provides a button
 * to trigger the SeatMap modal (integration to be handled externally).
 */

import * as React from 'react';
import { PublicAirAvailabilityData } from 'sabre-ngv-airAvailability/services/PublicAirAvailabilityData';

export const SeatMapAvailTile = (data: PublicAirAvailabilityData): React.ReactElement => {

    // 🪵 Log the incoming data for debugging purposes
    console.log('🧩 [SeatMapAvailTile] Received data:', data);
        
    return (
        <div className={'sdk-seatmap-custom-tile-content'} style={{ padding: '10px' }}> 
            
            {/* 🔽 Display flight segments as a list */}
            <ol>
                {data.flightSegments.map((segment, index) => (
                    <li key={index}>
                        Flight {segment.MarketingAirline.FlightNumber}
                    </li>  
                ))}
            </ol>

            {/* 🎯 Seat Map trigger button (placeholder – action must be wired externally) */}
            <button 
                className="abc-seatmap-button"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 10px',
                    backgroundColor: '#2f73bc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    height: '24px',
                    marginBottom: '10px',
                    marginLeft: '25px'
                }}
            >
                SeatMaps ABC 360
            </button>

        </div>
    );
};