// file: code/services/ShowAgentProfile.tsx

/**
 * ShowAgentProfile.tsx
 * 
 * 👤 UI-компонент для отображения информации о текущем агенте Sabre.
 * 
 * Принимает объект `agent` с данными профиля и визуализирует их в виде таблицы.
 * Используется в отладочных или вспомогательных интерфейсах, где нужно показать:
 * - PCC (Pseudo City Code)
 * - Идентификатор агента
 * - Локаль, страна, регион
 * - ID сотрудника и бизнес-единицы клиента
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
    };
}

export const ShowAgentProfile: React.FC<ShowAgentProfileProps> = ({ agent }) => {
    return (
        <div style={{ padding: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
            {/* === 👤 AGENT PROFILE HEADER === */}
            <h3>👤 Agent Profile</h3>

            {/* 📋 Таблица с полями профиля */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
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
        </div>
    );
};

// 🧾 Стили для заголовков таблицы (левая колонка)
const thStyle: React.CSSProperties = {
    borderBottom: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    width: '40%'
};

// 📄 Стили для значений (правая колонка)
const tdStyle: React.CSSProperties = {
    borderBottom: '1px solid #eee',
    padding: '8px',
};