// ✅ file: /code/components/seatMap/internal/SeatTooltip.tsx

import * as React from 'react';

interface SeatTooltipProps {
    seatInfo: {
        rowNumber: string;
        column: string;
        cabinClass: string;
        price?: string;
        characteristicsText?: string; // Многострочный текст с флагами, если есть
    };
    position?: 'top' | 'bottom';
}

const SeatTooltip: React.FC<SeatTooltipProps> = ({ seatInfo, position = 'top' }) => {
    if (!seatInfo) return null;

    const tooltipTop = position === 'bottom' ? '3.2rem' : '-7.2rem';

    return (
        <div
            style={{
                position: 'absolute',
                top: tooltipTop,
                left: '-3rem',
                transform: position === 'top' ? 'translateY(-86%)' : 'translateY(94%)',
                backgroundColor: '#fff', // теперь белый фон
                color: '#000',           // текст черный
                padding: '0.8rem 1rem',
                borderRadius: '0.6rem',
                whiteSpace: 'pre-line',
                fontSize: '1.5rem',
                minWidth: '18rem',
                maxWidth: '24rem',
                lineHeight: 1.6,
                border: '1px solid #ccc',
                boxShadow: '0px 0px 6px rgba(0,0,0,0.3)',
                zIndex: 100,
                pointerEvents: 'none',
                textAlign: 'left',
            }}
        >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {seatInfo.rowNumber}{seatInfo.column} {seatInfo.cabinClass}
            </div>
            {seatInfo.price && (
                <div style={{ marginBottom: '0.5rem' }}>{seatInfo.price}</div>
            )}
            {seatInfo.characteristicsText && (
                <div>{seatInfo.characteristicsText}</div>
            )}

            {/* ▼ Добавляем стрелочку */}
            {/* Внешний серый треугольник (обводка) */}
            <div
                style={{
                    position: 'absolute',
                    left: '3.2rem',
                    width: 0,
                    height: 0,
                    borderLeft: '0.8rem solid transparent',
                    borderRight: '0.8rem solid transparent',
                    ...(position === 'top'
                        ? {
                            top: '100%',
                            borderTop: '0.8rem solid #ccc',
                        }
                        : {
                            bottom: '100%',
                            borderBottom: '0.8rem solid #ccc',
                        }),
                    zIndex: 101,
                }}
            />

            {/* Внутренний белый треугольник (фон тултипа) */}
            <div
                style={{
                    position: 'absolute',
                    left: '3.2rem',
                    width: 0,
                    height: 0,
                    borderLeft: '0.7rem solid transparent',
                    borderRight: '0.7rem solid transparent',
                    ...(position === 'top'
                        ? {
                            top: 'calc(100% - 0.1rem)',
                            borderTop: '0.7rem solid #fff',
                        }
                        : {
                            bottom: 'calc(100% - 0.1rem)',
                            borderBottom: '0.7rem solid #fff',
                        }),
                    zIndex: 102,
                }}
            />

        </div>
    );
};

export default SeatTooltip;