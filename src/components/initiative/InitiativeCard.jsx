import { useInitiative } from "../../context/InitiativeContext";
import StatusBadge from "../ui/StatusBadge";

export default function InitiativeCard({
  initiative,
  onEdit,
  onDelete,
}) {
  const { setSelectedInitiative } = useInitiative();

  const handleCardClick = () => {
    setSelectedInitiative(initiative);
  };

  const handleEdit = (event) => {
    event.stopPropagation();

    if (onEdit) {
      onEdit(initiative);
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();

    if (onDelete) {
      onDelete(initiative);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-indigo-500 transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-white text-lg font-semibold">
            {initiative.title}
          </h2>

          <p className="text-slate-400 mt-1">
            {initiative.description || "No description"}
          </p>
        </div>

        <StatusBadge status={initiative.status} />
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Progress</span>

          <span>{initiative.progress}%</span>
        </div>

        <div className="h-2 bg-slate-700 rounded mt-2">
          <div
            className="h-full rounded bg-indigo-500"
            style={{
              width: `${initiative.progress}%`,
            }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6 text-sm">
        <span className="text-slate-400">
          Due: {initiative.due_date || "--"}
        </span>

        <div className="space-x-4">
          <button
            onClick={handleEdit}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}