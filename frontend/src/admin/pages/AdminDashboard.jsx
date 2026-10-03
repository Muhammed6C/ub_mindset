import React from 'react';
import HeroBanner from '../components/HeroBanner';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import PopularProducts from '../components/PopularProducts';
import RecentOrders from '../components/RecentOrders';
import LowStock from '../components/LowStock';
import LatestProducts from '../components/LatestProducts';
import SalesDistribution from '../components/SalesDistribution';
import MarketingBanner from '../components/MarketingBanner';
import { kpiStats } from '../data/dashboardMockData';

export default function AdminDashboard() {
  const scrollToSales = () => {
    const el = document.getElementById('sales-chart-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="ub-dashboard-root">
      {/* ── Main Dashboard Grid (Left Columns + Right Column) ── */}
      <div className="ub-dashboard-layout-grid">
        {/* ─── LEFT MAIN SECTION ─── */}
        <div className="ub-dashboard-left-col">
          {/* 1. Hero Banner */}
          <HeroBanner onStatsClick={scrollToSales} />

          {/* 2. 4 KPI Stat Cards */}
          <div className="ub-kpi-grid-row">
            {kpiStats.map((stat) => (
              <StatCard key={stat.id} item={stat} />
            ))}
          </div>

          {/* 3. Mid Row: SalesChart + PopularProducts */}
          <div id="sales-chart-section" className="ub-mid-grid-row">
            <div className="ub-mid-left">
              <SalesChart />
            </div>
            <div className="ub-mid-right">
              <PopularProducts />
            </div>
          </div>

          {/* 4. Bottom Row: LatestProducts + SalesDistribution */}
          <div className="ub-bottom-grid-row">
            <div className="ub-bottom-left">
              <LatestProducts />
            </div>
            <div className="ub-bottom-right">
              <SalesDistribution />
            </div>
          </div>
        </div>

        {/* ─── RIGHT COMPACT COLUMN ─── */}
        <div className="ub-dashboard-right-col">
          {/* 5. Commandes récentes */}
          <RecentOrders />

          {/* 6. Stock faible */}
          <LowStock />

          {/* 7. Bannière Marketing Collection Automne-Hiver */}
          <MarketingBanner />
        </div>
      </div>
    </div>
  );
}
