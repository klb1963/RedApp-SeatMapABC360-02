// file: code/components/seatMap/panels/SegmentCabinSelector.tsx

import * as React from 'react';
import { t } from '../../../Context';
import { normalizeSegment } from '../../../utils/normalizeSegment';

interface SegmentCabinSelectorProps {
  flightSegments: any[];
  segmentIndex: number;
  setSegmentIndex: (index: number) => void;
  cabinClass: 'Y' | 'S' | 'C' | 'F' | 'A';
  setCabinClass: (code: 'Y' | 'S' | 'C' | 'F' | 'A') => void;
}

export const SegmentCabinSelector: React.FC<SegmentCabinSelectorProps> = ({
  flightSegments,
  segmentIndex,
  setSegmentIndex,
  cabinClass,
  setCabinClass
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem',
        paddingLeft: '1.5rem'
      }}>
      <div style={{ position: 'relative' }}>
        <label style={{ marginRight: '0.5rem' }}>{t('seatMap.segment')}:</label>
        <select
          value={segmentIndex}
          onChange={(e) => {
            setSegmentIndex(Number(e.target.value));
            setCabinClass('Y');
          }}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
            padding: '0.25rem 1.5rem 0.25rem 0.5rem',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '200px'
          }}>
          {flightSegments.map((seg: any, idx: number) => {
            const s = normalizeSegment(seg, { padFlightNumber: false });
            return (
              <option key={idx} value={idx}>
                {s.origin} → {s.destination}, {s.flightNumber}
              </option>
            );
          })}
        </select>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#234E55'
          }}>
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ position: 'relative', display: 'inline-block', marginTop: '0rem' }}>
        <label style={{ marginRight: '0.5rem' }}>{t('seatMap.cabinClass')}:</label>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
            padding: '0.25rem 2rem 0.25rem 0.5rem',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '200px'
          }}>
            <option value="Y">Y — {t('seatMap.cabin.economy')}</option>
            <option value="S">S — {t('seatMap.cabin.premiumEconomy')}</option>
            <option value="C">C — {t('seatMap.cabin.business')}</option>
            <option value="F">F — {t('seatMap.cabin.first')}</option>
            <option value="A">A — {t('seatMap.cabin.all')}</option>
        </select>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#234E55'
          }}>
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};