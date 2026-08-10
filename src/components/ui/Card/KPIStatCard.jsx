import Card from "./Card";

export default function KPIStatCard({
  title,
  value,
  subtitle,
  icon,
  color = "text-indigo-400",
}) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-white mt-2">
            {value}
          </h2>

          {subtitle && (
            <p className="text-sm text-slate-500 mt-3">
              {subtitle}
            </p>
          )}

        </div>

        <div className={`text-3xl ${color}`}>
          {icon}
        </div>

      </div>
    </Card>
  );
}