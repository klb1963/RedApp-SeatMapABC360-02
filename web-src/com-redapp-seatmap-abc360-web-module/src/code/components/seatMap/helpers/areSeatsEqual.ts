import { SelectedSeat } from '../SeatMapComponentBase';

export function areSeatsEqual(
  a: SelectedSeat[],
  b: SelectedSeat[]
): boolean {
  if (a.length !== b.length) return false;

  const sortFn = (s: SelectedSeat) => `${s.passengerId}-${s.seatLabel}`;
  const aSorted = [...a].sort((x, y) => sortFn(x).localeCompare(sortFn(y)));
  const bSorted = [...b].sort((x, y) => sortFn(x).localeCompare(sortFn(y)));

  return aSorted.every((seat, index) =>
    seat.passengerId === bSorted[index].passengerId &&
    seat.seatLabel === bSorted[index].seatLabel
  );
}