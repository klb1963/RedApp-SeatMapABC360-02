🧩 SeatMapComponentBase – Architectural Overview

📍 Purpose

SeatMapComponentBase is the core controller of the seat map UI. It acts as a bridge between Sabre flight/PNR data and the external SeatMap rendering engine (embedded via iframe).

⸻

🧱 Main Responsibilities
	1.	Passenger & Seat Management
	•	Normalizes passengers (ensurePassengerIds)
	•	Tracks selected seats (selectedSeats)
	•	Initializes assigned seats from Sabre (assignedSeats)
	•	Handles auto-seating and manual seat selection
	2.	Flight Segment Handling
	•	Uses flightSegments and cabinClass to generate data for seat map
	•	Syncs when the user switches segment or cabin class
	3.	Rendering to External Engine
	•	Sends config, flight, availability, passengers, and selectedSeats to the SeatMap iframe via postMessage()
	•	Responds to events like seat selection from the iframe
	4.	UI Composition
	•	Wraps layout in SeatMapModalLayout
	•	Injects panels:
	•	PassengerPanel (right column)
	•	GalleryPanel (optional)
	•	Embeds the iframe with the external seat map renderer

⸻

🔁 Data Flow

Sabre PNR / Availability
    ↓
 [props: passengers, segments, availability]
    ↓
 SeatMapComponentBase
    ↓ normalize / assign seats
 postMessage() to iframe → external rendering
    ↑
  listen for events (seat selected, etc.)
    ↑
  update internal state (selectedSeats)


⸻

🔧 Key Hooks & Helpers

Name	Role
useOnIframeLoad	Syncs data on first load of iframe
useSyncOnSegmentChange	Re-syncs data when segment changes
useSyncOnCabinClassChange	Updates seat map when class changes
useSeatSelectionHandler	Handles messages from iframe
createSelectedSeat()	Generates payload with seat price etc.
postSeatMapUpdate()	Sends structured data to SeatMap iframe


⸻

🧪 Debugging & Developer Tools
	•	window.selectedSeats mirrors current seat selections for testing.
	•	Console logs track seat initialization, segment syncs, postMessage calls.