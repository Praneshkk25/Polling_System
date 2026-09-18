import React from 'react';
import { BarChart2, Users, Eye, TrendingUp } from 'lucide-react';

export default function StatsRow({ stats }) {
  const formatNum = (num, fallback) => {
    if (!num && num !== 0) return fallback;
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const statItems = [
    {
      label: 'Total Polls',
      value: stats ? stats.totalPolls : 12,
      icon: BarChart2,
      colorClass: 'blue',
    },
    {
      label: 'Total Votes',
      value: stats ? formatNum(stats.totalVotes, '2.4K') : '2.4K',
      icon: Users,
      colorClass: 'teal',
    },
    {
      label: 'Total Views',
      value: stats ? formatNum(stats.totalViews, '6.8K') : '6.8K',
      icon: Eye,
      colorClass: 'indigo',
    },
    {
      label: 'Engagement Rate',
      value: stats ? `${Math.round(stats.engagementRate || 94)}%` : '94%',
      icon: TrendingUp,
      colorClass: 'sky',
    },
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="stat-card">
            <div className={`stat-icon-wrapper ${item.colorClass}`}>
              <Icon size={20} strokeWidth={2.4} />
            </div>
            <div className="stat-content">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
