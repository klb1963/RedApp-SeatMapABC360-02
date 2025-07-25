// file: code/services/ShowAgentProfile.tsx

/**
 * ShowAgentProfile.tsx
 * 
 * 👤 UI component for displaying the current Sabre agent profile information and configuring Seat Map ABC 360 Setup.
 * 
 * Accepts an `agent` object with profile data and renders it as a table.
 * Used in debug or auxiliary interfaces to display:
 * - PCC (Pseudo City Code)
 * - Agent ID
 * - Locale, country, region
 * - Customer employee ID and business unit
 */

import * as React from 'react';
import { IModulePreferencesService } from 'sabre-ngv-preferences/services/IModulePreferencesService';
import { getService } from '../Context';

interface ShowAgentProfileProps {
  agent: {
    agentId: string;
    pcc: string;
    country: string;
    region: string;
    locale: string;
    customerBusinessUnit: string;
    customerEmployeeId: string;
  };
}

const ShowAgentProfile = React.forwardRef<{ save: () => void }, ShowAgentProfileProps>(
    ({ agent }, ref) => {
        const [appUrl, setAppUrl] = React.useState('https://seatmaps.com');
        const [appId, setAppId] = React.useState('ABC360_APP_ID');
        const [appKey, setAppKey] = React.useState('ABC360_APP_KEY');

        React.useEffect(() => {
            const loadPreferences = async () => {
                const prefService = getService(IModulePreferencesService);
                const prefs = (await prefService.getPreferences()) as {
                    APP_URL?: string;
                    APP_ID?: string;
                    APP_KEY?: string;
                };
                setAppUrl(prefs.APP_URL ?? 'https://seatmaps.com');
                setAppId(prefs.APP_ID ?? 'ABC360_APP_ID');
                setAppKey(prefs.APP_KEY ?? 'ABC360_APP_KEY');
            };
            loadPreferences();
        }, []);

        const save = async () => {
            try {
                const prefService = getService(IModulePreferencesService);
                await prefService.setPreferences({
                    APP_URL: appUrl,
                    APP_ID: appId,
                    APP_KEY: appKey,
                });
                alert('✅ Preferences saved successfully!');
            } catch (err) {
                console.error('❌ Failed to save preferences:', err);
                alert('❌ Failed to save preferences.');
            }
        };

  // Expose .save() method via ref
  React.useImperativeHandle(ref, () => ({ save }));

  return (
    <div style={{ padding: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
      <h3>Seat Map ABC 360 Setup</h3>

      {/* Agent Info Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr><th style={sectionHeaderStyle} colSpan={2}>AGENT PROFILE</th></tr>
        </thead>
        <tbody>
          <tr><td style={thStyle}>Agent ID</td><td style={tdStyle}>{agent.agentId}</td></tr>
          <tr><td style={thStyle}>PCC</td><td style={tdStyle}>{agent.pcc}</td></tr>
          <tr><td style={thStyle}>Country</td><td style={tdStyle}>{agent.country}</td></tr>
          <tr><td style={thStyle}>Region</td><td style={tdStyle}>{agent.region}</td></tr>
          <tr><td style={thStyle}>Locale</td><td style={tdStyle}>{agent.locale}</td></tr>
          <tr><td style={thStyle}>Business Unit</td><td style={tdStyle}>{agent.customerBusinessUnit}</td></tr>
          <tr><td style={thStyle}>Employee ID</td><td style={tdStyle}>{agent.customerEmployeeId}</td></tr>
        </tbody>
      </table>

      {/* Config Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr><th style={sectionHeaderStyle} colSpan={2}>Seat Map ABC 360 Setup</th></tr>
        </thead>
        <tbody>
          <tr>
            <td style={thStyle}>APP_URL</td>
            <td style={tdStyle}>
              <input type="text" value={appUrl} onChange={e => setAppUrl(e.target.value)} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={thStyle}>APP_ID</td>
            <td style={tdStyle}>
              <input type="text" value={appId} onChange={e => setAppId(e.target.value)} style={inputStyle} />
            </td>
          </tr>
          <tr>
            <td style={thStyle}>APP_KEY</td>
            <td style={tdStyle}>
              <input type="text" value={appKey} onChange={e => setAppKey(e.target.value)} style={inputStyle} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

// Styles
const thStyle: React.CSSProperties = {
  borderBottom: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
  backgroundColor: '#f5f5f5',
  width: '40%'
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '8px',
};

const sectionHeaderStyle: React.CSSProperties = {
  backgroundColor: '#ddd',
  fontWeight: 'bold',
  padding: '6px',
  textAlign: 'left'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px',
  boxSizing: 'border-box',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

export default ShowAgentProfile;