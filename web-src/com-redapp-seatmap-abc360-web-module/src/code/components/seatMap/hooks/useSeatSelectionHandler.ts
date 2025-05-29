// file: code/components/seatMap/hooks/useSeatSelectionHandler.ts

/**
 * useSeatSelectionHandler.ts
 * 
 * 🪑 Custom React hook that handles seat selection messages from the embedded SeatMap iframe.
 * 
 * Responsibilities:
 * - Listens for postMessage events from https://quicket.io
 * - Parses and validates the incoming seat selection payload (onSeatSelected)
 * - Updates the selectedSeats state with new assignments
 * - Determines if all passengers are seated and sets boardingComplete flag
 * - Automatically advances to the next unseated passenger (auto-focus behavior)
 * 
 * This hook connects the SeatMap UI with the RedApp passenger management logic,
 * enabling interactive and sequential seat assignment.
 */

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { createSelectedSeat } from '../helpers/createSelectedSeat';

// Тип, как приходят данные из parseSeatMapResponse
interface RawAvailabilityItem {
  label: string;           // Пример: "60A"
  price?: number;          // Пример: 57
  currency?: string;       // Пример: "EUR"
}

// Тип, который ожидает createSelectedSeat
interface ProcessedAvailabilityItem {
  seatLabel: string;       // То же самое, но в формате { seatLabel: "60A" }
  price?: string;          // Строка, например "EUR 57.00"
}

interface Props {
  cleanPassengers: PassengerOption[];
  selectedPassengerId: string;
  setSelectedPassengerId: (id: string) => void;
  setSelectedSeats: React.Dispatch<React.SetStateAction<SelectedSeat[]>>;
  setBoardingComplete: (status: boolean) => void;
  onSeatChange?: (seats: SelectedSeat[]) => void;
  availability?: RawAvailabilityItem[]; // Исходный массив доступных мест
}

export const useSeatSelectionHandler = ({
  cleanPassengers,
  selectedPassengerId,
  setSelectedPassengerId,
  setSelectedSeats,
  setBoardingComplete,
  onSeatChange,
  availability
}: Props): void => {
  useEffect(() => {
    const handleSeatSelection = (event: MessageEvent) => {
      // Безопасность: разрешаем только сообщения от quicket.io
      if (event.origin !== 'https://quicket.io') {
        console.warn('⚠️ Unknown message origin:', event.origin);
        return;
      }

      // Пробуем распарсить postMessage
      let parsed;
      try {
        parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        console.error('❌ Failed to parse postMessage:', e);
        return;
      }

      if (!parsed?.onSeatSelected) return;

      // Обрабатываем onSeatSelected как строку или как объект
      let seatArray = parsed.onSeatSelected;
      if (typeof seatArray === 'string') {
        try {
          seatArray = JSON.parse(seatArray);
        } catch (e) {
          console.error('❌ Failed to parse onSeatSelected:', e);
          return;
        }
      }

      if (!Array.isArray(seatArray)) return;

      // 👀 DEBUG: что передано в availability
      console.log('📦 Raw availability before mapping:', availability);

      // ✅ Преобразуем availability → { seatLabel, price }
      const availabilityMapped: ProcessedAvailabilityItem[] | undefined = availability?.map((a) => ({
        seatLabel: a.label,
        price: a.currency && a.price !== undefined
          ? `${a.currency} ${a.price.toFixed(2)}`
          : undefined
      }));

      console.log('✅ Mapped availability for lookup:', availabilityMapped);

      // 📌 Формируем список назначенных мест
      const updated = seatArray
        .filter(p => p.id && p.seat?.seatLabel)
        .map(p => {
          const passenger = cleanPassengers.find(pass => String(pass.id) === String(p.id));
          if (!passenger) return null;

          return createSelectedSeat(passenger, p.seat.seatLabel, false, availabilityMapped);
        })
        .filter(Boolean) as SelectedSeat[];

      // 💾 Обновляем состояние выбранных мест
      setSelectedSeats(prev => {
        const withoutOld = prev.filter(s => !updated.some(u => u.passengerId === s.passengerId));
        const merged = [...withoutOld, ...updated];

        // 💬 Отдаём наверх (например, для сохранения или отображения)
        onSeatChange?.(merged);

        // 🟢 Проверяем: все ли пассажиры рассажены?
        const allSeated = cleanPassengers.every(p =>
          merged.some(s => s.passengerId === p.id)
        );
        setBoardingComplete(allSeated);

        // ⏭️ Автоматически переключаемся на следующего
        const nextPassenger = cleanPassengers.find(
          p => !merged.some(s => s.passengerId === String(p.id))
        );
        if (nextPassenger) {
          setSelectedPassengerId(String(nextPassenger.id));
        }

        return merged;
      });
    };

    // 🔌 Подключаем обработчик
    window.addEventListener('message', handleSeatSelection);
    return () => window.removeEventListener('message', handleSeatSelection);
  }, [cleanPassengers, selectedPassengerId, setSelectedPassengerId, setSelectedSeats, setBoardingComplete, onSeatChange, availability]);
};