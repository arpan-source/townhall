export default function PageHeader({
  title,
  subtitle,
  actions,
}) {
  return (
    <div className="flex items-start justify-between mb-8">

      <div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-slate-400 mt-2">
            {subtitle}
          </p>
        )}

      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}

    </div>
  );
}