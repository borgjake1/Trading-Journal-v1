import React from 'react';
    import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
    import { Trade } from '../types/trade';
    import { useThemeStore } from '../store/useThemeStore';

    type MetricType = 'pnl' | 'rr';

    interface CalendarViewProps {
      selectedDate: Date;
      metricType: MetricType;
      trades: Trade[];
    }

    export function CalendarView({ selectedDate, metricType, trades }: CalendarViewProps) {
      const { isDarkMode } = useThemeStore();
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const getDayMetrics = (date: Date) => {
        const dayTrades = trades.filter((trade) => 
          isSameDay(new Date(trade.exitDate), date)
        );

        if (dayTrades.length === 0) return null;

        const pnl = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
        const rr = dayTrades.reduce((sum, trade) => {
          const risk = Math.abs(trade.entryPrice - trade.stopLoss);
          const reward = Math.abs(trade.takeProfit - trade.entryPrice);
          return sum + (reward / risk);
        }, 0) / dayTrades.length;

        return {
          pnl,
          rr,
          tradeCount: dayTrades.length
        };
      };

      const getMetricColor = (metrics: { pnl: number; rr: number; tradeCount: number }) => {
        if (!metrics) return isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
        
        const value = metricType === 'pnl' ? metrics.pnl : metrics.rr;
        
        if (metricType === 'pnl') {
          if (value > 0) return isDarkMode ? 'bg-green-900 hover:bg-green-800' : 'bg-green-100 hover:bg-green-200';
          if (value < 0) return isDarkMode ? 'bg-red-900 hover:bg-red-800' : 'bg-red-100 hover:bg-red-200';
          return isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200';
        } else {
          if (value >= 2) return isDarkMode ? 'bg-green-900 hover:bg-green-800' : 'bg-green-100 hover:bg-green-200';
          if (value >= 1) return isDarkMode ? 'bg-blue-900 hover:bg-blue-800' : 'bg-blue-100 hover:bg-blue-200';
          return isDarkMode ? 'bg-yellow-900 hover:bg-yellow-800' : 'bg-yellow-100 hover:bg-yellow-200';
        }
      };

      const formatMetric = (metrics: { pnl: number; rr: number; tradeCount: number }) => {
        if (!metrics) return '';
        
        if (metricType === 'pnl') {
          return `$${metrics.pnl.toFixed(2)}`;
        } else {
          return `${metrics.rr.toFixed(2)}R`;
        }
      };

      return (
        <div className={`rounded-lg shadow p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {days.map((day) => {
              const metrics = getDayMetrics(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square p-2 rounded-lg ${getMetricColor(metrics)} transition-colors`}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400">{format(day, 'd')}</div>
                  {metrics && (
                    <>
                      <div className="text-sm font-medium dark:text-white">{formatMetric(metrics)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{metrics.tradeCount} trade{metrics.tradeCount !== 1 ? 's' : ''}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
