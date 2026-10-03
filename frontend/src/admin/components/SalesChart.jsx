import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { salesChartData } from '../data/dashboardMockData';

const FILTERS = ['7J', '30J', '3M', '1A'];

const fmtFCFA = (v) => new Intl.NumberFormat('fr-FR').format(Math.round(v || 0)) + ' FCFA';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const sales = payload.find((p) => p.dataKey === 'sales')?.value || 0;
  const orders = payload.find((p) => p.dataKey === 'orders')?.value || 0;

  return (
    <div className="ub-chart-tooltip">
      <p className="ub-tooltip-label">{label}</p>
      <div className="ub-tooltip-row">
        <span className="ub-tooltip-dot sales" />
        <span className="ub-tooltip-title">Ventes :</span>
        <span className="ub-tooltip-value">{fmtFCFA(sales)}</span>
      </div>
      <div className="ub-tooltip-row">
        <span className="ub-tooltip-dot orders" />
        <span className="ub-tooltip-title">Commandes :</span>
        <span className="ub-tooltip-value">{orders}</span>
      </div>
    </div>
  );
}

export default function SalesChart() {
  const [activeFilter, setActiveFilter] = useState('30J');
  const data = salesChartData[activeFilter] || salesChartData['30J'];

  return (
    <div className="ub-card ub-sales-chart-card">
      {/* ── Header with Title and Time Filters ── */}
      <div className="ub-card-header">
        <h3 className="ub-card-title">Ventes & commandes</h3>

        <div className="ub-chart-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`ub-chart-filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart Area ── */}
      <div className="ub-chart-container" style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              yAxisId="sales"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : v)}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Barres pour les ventes en FCFA */}
            <Bar
              yAxisId="sales"
              dataKey="sales"
              fill="#E2E8F0"
              radius={[3, 3, 0, 0]}
              barSize={12}
            />
            {/* Courbe noire avec points pour les commandes */}
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#0A0A0A"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0A0A0A', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#0A0A0A', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ── */}
      <div className="ub-chart-legend">
        <div className="ub-legend-item">
          <span className="ub-legend-square" />
          <span className="ub-legend-text">Ventes (FCFA)</span>
        </div>
        <div className="ub-legend-item">
          <span className="ub-legend-line" />
          <span className="ub-legend-text">Commandes</span>
        </div>
      </div>
    </div>
  );
}
