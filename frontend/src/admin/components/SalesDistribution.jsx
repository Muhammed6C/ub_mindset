import React from 'react';
import { NavLink } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { salesDistribution } from '../data/dashboardMockData';

const COLORS = ['#0A0A0A', '#3A3F47', '#6B7280', '#9CA3AF', '#D1D5DB'];

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
      padding: '8px 12px',
      fontSize: '0.75rem',
      borderRadius: '4px',
      fontFamily: 'Archivo, sans-serif'
    }}>
      <p style={{ fontWeight: 700, marginBottom: 2 }}>{item.name}</p>
      <p style={{ color: '#9CA3AF' }}>{item.value}% du chiffre d'affaires</p>
    </div>
  );
}

export default function SalesDistribution() {
  const { total, items } = salesDistribution;

  return (
    <div className="ub-card ub-distribution-card">
      <div className="ub-card-header">
        <h3 className="ub-card-title">Répartition des ventes</h3>
        <NavLink to="/admin/reports" className="ub-card-link">
          Voir tout →
        </NavLink>
      </div>

      <div className="ub-distribution-content">
        {/* Donut Chart with central total */}
        <div className="ub-donut-wrapper">
          <div style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<DonutTooltip />} />
                <Pie
                  data={items}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={65}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  stroke="none"
                >
                  {items.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="ub-donut-center">
            <span className="ub-donut-amount">{total.split(' ')[0]} {total.split(' ')[1]}</span>
            <span className="ub-donut-currency">FCFA</span>
          </div>
        </div>

        {/* Legend list */}
        <div className="ub-distribution-legend">
          {items.map((item, idx) => (
            <div key={item.name} className="ub-dist-item">
              <div className="ub-dist-label">
                <span
                  className="ub-dist-dot"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="ub-dist-name">{item.name}</span>
              </div>
              <span className="ub-dist-pct">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
