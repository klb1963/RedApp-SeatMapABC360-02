import * as React from 'react';

interface SeatMapSabreModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const SeatMapSabreModal: React.FC<SeatMapSabreModalProps> = ({ onClose, children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '1200px',
        height: 'calc(100% - 100px)',
        background: '#fff',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          background: '#f3f3f3',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Seat Map</h2>
        <button onClick={onClose} style={{ fontSize: '1rem', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          background: '#fff',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SeatMapSabreModal;