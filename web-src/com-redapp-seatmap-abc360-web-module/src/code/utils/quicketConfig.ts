// file: /code/utils/quicketConfig.ts

/**
 * quicketConfig.ts
 *
 * 🎨 Configuration object for the Quicket.io SeatMap rendering library.
 * 
 * This controls appearance, layout, localization, and interactivity
 * for the embedded iframe-based seat map renderer.
 */

export const quicketConfig = {
  // === 📏 Base layout settings ===
  width: 400,               // Width of the rendering container in px
  lang: 'EN',               // Interface language (EN, DE, etc.)
  horizontal: false,        // Seat map scroll direction (false = vertical)
  rightToLeft: false,       // RTL layout support (e.g. for Arabic)
  visibleFuselage: false,   // Show outer fuselage frame
  visibleWings: true,       // Show airplane wings
  builtInDeckSelector: true,// Show deck selector (multi-deck aircraft)
  singleDeckMode: true,     // Force single-deck rendering
  builtInTooltip: true,     // Enable native tooltips for seats
  externalPassengerManagement: false, // Control passengers from iframe
  tooltipOnHover: false,    // Show tooltip only on click (not hover)

  // === 🎨 Color and style theme ===
  colorTheme: {
    deckLabelTitleColor: 'white',
    deckHeightSpacing: 100,
    wingsWidth: 50,
    deckSeparation: 0,

    // 🚪 Floor / seats / cabin styling
    floorColor: 'rgb(30,60,90)',
    seatLabelColor: 'white',
    // seatStrokeColor: 'rgb(237, 237, 237)',
    seatStrokeWidth: 1,
    // seatArmrestColor: '#cccccc',
    notAvailableSeatsColor: 'lightgray',

    // ✂️ Bulkhead zones
    bulkBaseColor: 'dimgrey',
    bulkCutColor: 'lightgrey',
    bulkIconColor: 'darkslategray',

    // 🧍 Passenger badge
    defaultPassengerBadgeColor: 'darkred',

    fontFamily: 'Montserrat, sans-serif',

    // 💬 Tooltip styling
    tooltipBackgroundColor: 'rgb(255,255,255)',
    tooltipHeaderColor: '#4f6f8f',
    tooltipBorderColor: 'rgb(255,255,255)',
    tooltipFontColor: '#4f6f8f',
    tooltipIconColor: '#4f6f8f',
    tooltipIconBorderColor: '#4f6f8f',
    tooltipIconBackgroundColor: '#fff',
    tooltipSelectButtonTextColor: '#fff',
    tooltipSelectButtonBackgroundColor: 'rgb(42, 85, 128)',
    tooltipCancelButtonTextColor: '#fff',
    tooltipCancelButtonBackgroundColor: 'rgb(55, 55, 55)',

    // 🔀 Deck selector
    deckSelectorStrokeColor: '#fff',
    deckSelectorFillColor: 'rgba(55, 55, 55, 0.5)',
    deckSelectorSize: 25,

    // 🛫 Fuselage & wings
    fuselageStrokeWidth: 16,
    fuselageFillColor: 'lightgrey',
    fuselageStrokeColor: 'darkgrey',
    fuselageWindowsColor: 'darkgrey',
    fuselageWingsColor: 'rgba(55, 55, 55, 0.5)',

    // 🚪 Emergency exit icons
    exitIconUrlLeft: 'https://panorama.quicket.io/icons/exit-left.svg',
    exitIconUrlRight: 'https://panorama.quicket.io/icons/exit-right.svg',
  }
};