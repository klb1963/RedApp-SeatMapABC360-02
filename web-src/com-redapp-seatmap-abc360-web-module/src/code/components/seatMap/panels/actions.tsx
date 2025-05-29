// file: code/components/seatMap/panels/actions.tsx

/**
 * UI Actions for SeatMap Modal
 *
 * This module exports a function that returns an array of JSX button elements
 * for use in the footer of a modal window. It includes:
 * - A "Close" button to cancel the operation and close the modal
 * - A "Save" button to submit selected seat assignments
 *
 * Used in: SeatMap modals (PNR, Pricing, Shopping)
 */

import { Button } from 'react-bootstrap';
import * as React from 'react';
import { t } from '../../../Context'; 


// Функция возвращает массив JSX-кнопок для модального окна
export const actions = (
  onButtonSubmit: () => void,
  onClickCancel: () => void,
  saveDisabled: boolean = false
): JSX.Element[] => [
  <Button key="cancel" className="btn-secondary" onClick={onClickCancel}>
    {t('seatMap.button.close')}
  </Button>,

  <Button
    key="submit"
    className="btn-success"
    onClick={onButtonSubmit}
    disabled={saveDisabled}
  >
    {t('seatMap.button.save')}
  </Button>
];