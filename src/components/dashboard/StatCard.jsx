export default function StatCard({
  title,
  value,
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold text-white mt-2">
        {value}
      </h2>
    </div>
  );
}