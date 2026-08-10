import { IconInbox } from "@tabler/icons-react";
import PrimaryButton from "./PrimaryButton";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) {
  const Icon = icon || IconInbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">

      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6">
        <Icon
          size={32}
          className="text-slate-400"
        />
      </div>

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="text-slate-400 mt-3 max-w-md">
        {description}
      </p>

      {actionLabel && (
        <PrimaryButton
          className="mt-8"
          onClick={onAction}
        >
          {actionLabel}
        </PrimaryButton>
      )}

    </div>
  );
}