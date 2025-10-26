import { FC } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor?: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, bgColor = 'bg-gray-100' }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
};

export default StatCard;
