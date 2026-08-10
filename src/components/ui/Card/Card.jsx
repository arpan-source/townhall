import clsx from "clsx";

export default function Card({
    children,
    className = "",
    hover = false,
}) {

    return (

        <div
            className={clsx(
                "bg-slate-900",
                "border border-slate-700",
                "rounded-2xl",
                "p-6",
                "transition-all duration-200",
                hover && "hover:border-indigo-500 hover:shadow-xl",
                className
            )}
        >

            {children}

        </div>

    );

}