# Use Case: Seat Map ABC 360 — PNR-Based Scenario

## Purpose
Allow agents to view, assign, reassign, and manage seat assignments for passengers in an active PNR using the custom Seat Map ABC 360 module.

---

## Actors

- **Travel Agent** – Sabre Red 360 user
- **Passenger** – traveler linked to the PNR
- **Sabre System** – SOAP backend
- **Seat Map ABC 360 Module** – RedApp interface

---

## Preconditions

- An active PNR is present with one or more air segments
- RedApp module is installed and enabled
- Required agent profile fields (e.g., APP_ID, APP_KEY) configured (for fallback)
- Passenger and segment data is retrievable via `GetReservationRQ`

---

## Main Flow

1. **Launch**
   - Agent types `§360` or clicks “SeatMap ABC 360” in the side panel
   - The modal window opens

2. **PNR Fetch**
   - Module sends `GetReservationRQ` using `loadPnrDetailsFromSabre.ts`
   - STL-format XML response is parsed via `parsePnrData.ts`
   - Returns structured PNR data: passengers, segments, seat assignments

3. **Segment & Cabin Selection**
   - UI shows segment and cabin class dropdowns
   - Defaults to first segment and economy class (if available)

4. **Seat Map Load**
   - Module sends `EnhancedSeatMapRQ`
   - XML is parsed and converted to a visual layout via `convertSeatMapToReactSeatmap.ts`
   - Tooltip info extracted from seat characteristics (Y, B, L, etc.)

5. **Initial Seat Assignment**
   - Seats already assigned in the PNR are rendered with initials
   - Tooltips show seat type, price, and features

6. **Manual Assignment**
   - Agent selects a passenger → clicks a seat
   - The seat is assigned visually and price displayed in panel

7. **Auto Assign**
   - Agent clicks “Auto-Assign Seats”
   - All unassigned passengers are automatically seated
   - Prefers standard > preferred > paid seats

8. **Reassign or Cancel**
   - ❌ icon removes a seat for a specific passenger
   - “Reassign seat” allows reselection before saving

9. **Save to PNR**
   - Agent clicks SAVE
   - The module sends `AirSeatAssignLLSRQ` requests for each passenger
   - Success or failure messages are shown

---

## Alternate Flows

- **No PNR**: Message shown — "No active PNR found"
- **Seat Map Load Failed**: fallback renderer used (without iframe)
- **Multi-deck aircraft**: deck switcher shown (e.g. “Upperdeck” / “Maindeck”)
- **Missing price**: “n/a” shown when seat price missing

---

## Postconditions

- Updated seat assignments are visible in Sabre PNR
- Module closes or remains open for further changes
- Visual confirmation of changes shown to agent

---

## Technical Implementation

| Item                      | Source File / Description                          |
|---------------------------|----------------------------------------------------|
| PNR Load                  | `loadPnrDetailsFromSabre.ts` → GetReservationRQ    |
| PNR Parse                 | `parsePnrData.ts`                                  |
| Seat Map Load             | `EnhancedSeatMapRQ` → parsed in `parseSeatMapResponse.ts` |
| Seat Layout Conversion    | `convertSeatMapToReactSeatmap.ts`                  |
| Deck Switching            | Based on `deckId` parsed from XML                  |
| Seat Assignment Save      | `handleSaveSeats.ts` using `AirSeatAssignLLSRQ`    |
| Auto Assign               | `handleAutomateSeating.ts`                         |
| UI Components             | `PassengerPanel`, `FlightInfoPanel`, etc.          |
| Fallback Rendering        | Used when iframe-based Quicket map fails           |
| Localization              | via `Context.ts` and i18n strings like `t('seatMap.xyz')` |

---

## Security

- No personal data is stored outside Sabre
- All SOAP calls authenticated with Sabre session token
- No credit card or PII data processed or persisted

---

## Notes

