interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

export const StatCard = ({ label, value, color }: StatCardProps) => {
  return (
    <div className={`${color} text-white rounded-lg shadow p-6`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};
