// file: components/seatMap/panels/CreatePnrButton.tsx

import * as React from 'react';
import { createPnrForm } from '../forms/CreatePnrForm';

export const CreatePnrButton: React.FC = () => {
  const handleClick = () => {
    createPnrForm(); // Просто вызываем функцию, которая сама откроет форму
  };

  return (
    <button onClick={handleClick} style={{ float: 'right', marginBottom: '1rem' }}>
      ➕ Create PNR
    </button>
  );
};
