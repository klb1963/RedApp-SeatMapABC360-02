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

interface ShowAgentProfileProps {
    agent: {
        agentId: string;
        pcc: string;
        country: string;
        region: string;
        locale: string;
        customerBusinessUnit: string;
        customerEmployeeId: string;
        appUrl: string;
        appId: string;
        appKey: string;
    };
}

export const ShowAgentProfile: React.FC<ShowAgentProfileProps> = ({ agent }) => {
    const [appUrl, setAppUrl] = React.useState(agent.appUrl);
    const [appId, setAppId] = React.useState(agent.appId);
    const [appKey, setAppKey] = React.useState(agent.appKey);

    const handleSave = () => {
        console.log('Saving values:', {
            appUrl,
            appId,
            appKey,
        });
        alert(`Saved:\nURL: ${appUrl}\nID: ${appId}\nKEY: ${appKey}`);
    };

    const handleClose = () => {
        const modal = document.querySelector('.public-modal-class .public-react-modal');
        if (modal) {
            (modal.querySelector('.public-modal-close-button') as HTMLElement)?.click();
        }
    };

    return (
        <div style={{ padding: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
            {/* === 🛠️ SETUP HEADER === */}
            <h3>Seat Map ABC 360 Setup</h3>

            {/* === 👤 AGENT PROFILE === */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th style={sectionHeaderStyle} colSpan={2}>AGENT PROFILE</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style={thStyle}>Agent ID</td><td style={tdStyle}>{agent.agentId}</td></tr>
                    <tr><td style={thStyle}>PCC</td><td style={tdStyle}>{agent.pcc}</td></tr>
                    <tr><td style={thStyle}>Country</td><td style={tdStyle}>{agent.country}</td></tr>
                    <tr><td style={thStyle}>Region</td><td style={tdStyle}>{agent.region}</td></tr>
                    <tr><td style={thStyle}>Locale</td><td style={tdStyle}>{agent.locale}</td></tr>
                    <tr><td style={thStyle}>Customer Business Unit</td><td style={tdStyle}>{agent.customerBusinessUnit}</td></tr>
                    <tr><td style={thStyle}>Customer Employee ID</td><td style={tdStyle}>{agent.customerEmployeeId}</td></tr>
                </tbody>
            </table>

            {/* === ⚙️ SETUP FIELDS === */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={sectionHeaderStyle} colSpan={2}>Seat Map ABC 360 Setup</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={thStyle}>APP_URL</td>
                        <td style={tdStyle}>
                            <input
                                type="text"
                                value={appUrl}
                                onChange={e => setAppUrl(e.target.value)}
                                style={inputStyle}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td style={thStyle}>APP_ID</td>
                        <td style={tdStyle}>
                            <input
                                type="text"
                                value={appId}
                                onChange={e => setAppId(e.target.value)}
                                style={inputStyle}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td style={thStyle}>APP_KEY</td>
                        <td style={tdStyle}>
                            <input
                                type="text"
                                value={appKey}
                                onChange={e => setAppKey(e.target.value)}
                                style={inputStyle}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>
    );
};

// Table header cell styles (left column)
const thStyle: React.CSSProperties = {
    borderBottom: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    width: '40%'
};

// Table data cell styles (right column)
const tdStyle: React.CSSProperties = {
    borderBottom: '1px solid #eee',
    padding: '8px',
};

// Section header style (gray header row)
const sectionHeaderStyle: React.CSSProperties = {
    backgroundColor: '#ddd',
    fontWeight: 'bold',
    padding: '6px',
    textAlign: 'left'
};

// Input style (editable fields)
const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid #ccc'
};