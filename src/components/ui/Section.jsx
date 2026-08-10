import clsx from "clsx";
import Card from "./Card/Card";

export default function Section({
  title,
  subtitle,
  actions,
  children,
  className = "",
}) {
  return (
    <Card className={clsx("space-y-6", className)}>

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">
              {subtitle}
            </p>
          )}

        </div>

        {actions && (
          <div>
            {actions}
          </div>
        )}

      </div>

      <div>
        {children}
      </div>

    </Card>
  );
}