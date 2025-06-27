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

    // const tooltipTop = position === 'bottom' ? '6.5rem' : '2rem';

    const isEconomy = seatInfo.cabinClass.toLowerCase().includes('economy');
    const tooltipTop = position === 'bottom'
        ? isEconomy ? '6.5rem' : '5.5rem'
        : isEconomy ? '2rem' : '0.75rem';

    return (
        <div
            style={{
                position: 'absolute',
                top: tooltipTop,               // ✅ снова включаем top
                left: '-3rem',
                transform: position === 'top' ? 'translateY(-100%)' : 'translateY(0%)', // ✅ ключевой момент
                backgroundColor: '#fff',
                color: '#000',
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

            {/* Внешний серый треугольник (обводка) */}
            <div
                style={{
                    position: 'absolute',
                    left: '4rem',
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
                    left: '4rem',
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