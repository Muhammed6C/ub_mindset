import React from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import PopularProducts from '../components/PopularProducts';
import RecentOrders from '../components/RecentOrders';
import LowStock from '../components/LowStock';
import LatestProducts from '../components/LatestProducts';
import { kpiStats } from '../data/dashboardMockData';

export default function AdminDashboard() {
  const scrollToSales = () => {
    const el = document.getElementById('sales-chart-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="ub-dashboard-root">
      <header className="ub-admin-page-lead">
        <div>
          <p>UB MINDSET / PERFORMANCE STUDIO</p>
          <h1>VUE D’ENSEMBLE</h1>
          <span>Les signaux essentiels de la marque, avec le rythme de la communauté.</span>
        </div>
        <div className="ub-admin-page-lead__actions">
          <Link to="/admin/orders">VOIR LES COMMANDES</Link>
          <Link to="/admin/products" className="is-dark">GÉRER LE CATALOGUE <span aria-hidden="true">→</span></Link>
        </div>
      </header>
      {/* ── Main Dashboard Grid (Left Columns + Right Column) ── */}
      <div className="ub-dashboard-layout-grid">
        {/* ─── LEFT MAIN SECTION ─── */}
        <div className="ub-dashboard-left-col">
          {/* 1. Hero Banner */}
          <HeroBanner onStatsClick={scrollToSales} />

          {/* 2. 4 KPI Stat Cards */}
          <div className="ub-kpi-grid-row">
            {kpiStats.map((stat, index) => (
              <StatCard key={stat.id} item={stat} index={index} />
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

          {/* 4. Catalogue récemment enrichi */}
          <div className="ub-dashboard-latest-row">
            <LatestProducts />
          </div>
        </div>

        {/* ─── RIGHT COMPACT COLUMN ─── */}
        <div className="ub-dashboard-right-col">
          {/* 5. Commandes récentes */}
          <RecentOrders />

          {/* 6. Stock faible */}
          <LowStock />

        </div>
      </div>
    </div>
  );
}
