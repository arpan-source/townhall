import clsx from "clsx";

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center",
        "px-5 py-3",
        "rounded-xl",
        "bg-indigo-600",
        "hover:bg-indigo-700",
        "text-white",
        "font-medium",
        "transition-all duration-200",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
        "shadow-sm",
        className,
      )}
    >
      <>
        {loading && (
          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}

        {children}
      </>
    </button>
  );
}
