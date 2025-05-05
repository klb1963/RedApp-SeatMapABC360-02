// file: src/components/pnrServices/UpdatePNR.tsx

import * as React from "react";
import { Button, Modal, Alert } from "react-bootstrap";

// Получаем доступ к сервисам Sabre Red 360 через DI
import { getService } from "../../Context";

// Сервис для управления модалками
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

// SOAP API для вызова SeatAssignmentRQ
import { ISoapApiService } from "sabre-ngv-communication/interfaces/ISoapApiService";

// Сервис для обновления данных PNR после изменений
import { PnrPublicService } from "sabre-ngv-app/app/services/impl/PnrPublicService";

// Пропсы, которые получает модалка
interface UpdatePNRProps {
  passengerRef: string;       // идентификатор пассажира, например "1.1"
  seatNumber: string;         // выбранное место, например "16C"
  flightNumber: string;       // номер рейса, например "2470"
  airlineCode: string;        // код авиакомпании, например "LH"
  origin: string;             // аэропорт отправления
  destination: string;        // аэропорт прибытия
  departureDate: string;      // дата отправления в формате "YYYY-MM-DD"
  amount?: string;            // цена (опционально)
  currency?: string;          // валюта (опционально)
  passengerName?: string;     // имя пассажира, например "PETROV/ALEX"
}

// Компонент с внутренним состоянием: idle | success | error
export class UpdatePNR extends React.Component<UpdatePNRProps, { status: 'idle' | 'success' | 'error' }> {
  constructor(props) {
    super(props);

    // начальное состояние — ожидание действия
    this.state = { status: 'idle' };

    // биндим методы
    this.assignSeat = this.assignSeat.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  // Метод, вызываемый при нажатии "Назначить"
  assignSeat() {
    const soap = getService(ISoapApiService);
    const modals = getService(PublicModalsService);
    const pnrService = getService(PnrPublicService);
  
    const {
      passengerRef,
      seatNumber,
      flightNumber = '0000',
      airlineCode = 'XX',
      origin = 'XXX',
      destination = 'YYY',
      departureDate = '2025-01-01'
    } = this.props;
  
    const xml = `
      <SeatAssignmentRQ xmlns="http://services.sabre.com/STL/v01" version="1.0.0">
        <SeatAssignmentInfo>
          <FlightSegment
            flightNumber="${flightNumber}"
            airlineCode="${airlineCode}"
            origin="${origin}"
            destination="${destination}"
            departureDate="${departureDate}" />
          <Passenger id="${passengerRef}" nameNumber="${passengerRef}" />
          <Seats>
            <Seat>
              <Number>${seatNumber}</Number>
            </Seat>
          </Seats>
        </SeatAssignmentInfo>
      </SeatAssignmentRQ>`;
  
    soap.callSws({
      action: 'SeatAssignmentRQ',
      payload: xml,
      authTokenType: 'SESSION'
    })
      .then((res) => {
        console.log('✅ Seat assignment result (full XML):', res.value);
  
        this.setState({ status: 'success' });
        pnrService.refreshData();
  
        // Через секунду — закрываем всё и показываем alert
        setTimeout(() => {
          modals.closeReactModal(); // закрывает UpdatePNR
          modals.closeReactModal(); // закрывает карту мест
          alert(`✅ Место ${seatNumber} успешно назначено.`);
        }, 1000);
      })
      .catch((err) => {
        console.error('❌ Seat assignment error (details):', err);
        this.setState({ status: 'error' });
      });
  }

  //===================================

  // Закрытие модалки
  handleClose() {
    getService(PublicModalsService).closeReactModal();
  }

  // UI в зависимости от состояния
  render() {
    const { seatNumber, passengerName } = this.props;

    // Успешное назначение
    if (this.state.status === 'success') {
      return (
        <Alert bsStyle="success" onDismiss={this.handleClose}>
          <h4>✅ Место назначено</h4>
          <p>Пассажир {passengerName} назначен на место {seatNumber}</p>
          <Button bsStyle="success" onClick={this.handleClose}>Закрыть</Button>
        </Alert>
      );
    }

    // Ошибка при назначении
    if (this.state.status === 'error') {
      return (
        <Alert bsStyle="danger" onDismiss={this.handleClose}>
          <h4>Ошибка</h4>
          <p>Не удалось назначить место. Попробуйте снова.</p>
          <Button onClick={this.assignSeat}>Повторить</Button>
          <Button onClick={this.handleClose}>Отмена</Button>
        </Alert>
      );
    }

    // Стандартный экран подтверждения
    return (
      <Modal.Dialog className="react-modal">
        <Modal.Header closeButton onHide={this.handleClose}>
          <Modal.Title>Подтверждение назначения</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Назначить место <strong>{seatNumber}</strong> пассажиру <strong>{passengerName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleClose}>Отмена</Button>
          <Button bsStyle="primary" onClick={this.assignSeat}>Назначить</Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}