// file: actions.tsx

import { Button } from 'react-bootstrap';
import * as React from 'react';

// Функция возвращает массив JSX-кнопок для модального окна
export const actions = (
  onButtonSubmit: () => void,
  onClickCancel: () => void
): JSX.Element[] => [
  <Button key="cancel" className="btn-secondary" onClick={onClickCancel}>
    Close
  </Button>,
  <Button key="submit" className="btn-success" onClick={onButtonSubmit}>
    Save
  </Button>
];