import PrimaryButton from "../../ui/PrimaryButton";

export default function InitiativeActions({
  onWeeklyUpdate,
  onEdit,
  onDelete,
}) {
  return (
    <div className="sticky bottom-0 bg-slate-900 pt-6 mt-10 border-t border-slate-700">

      <PrimaryButton
        className="w-full"
        onClick={onWeeklyUpdate}
      >
        + Weekly Update
      </PrimaryButton>

      <div className="grid grid-cols-2 gap-3 mt-3">

        <button
          onClick={onEdit}
          className="rounded-xl border border-slate-700 py-3 text-white hover:bg-slate-800 transition"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="rounded-xl bg-red-600 hover:bg-red-700 py-3 text-white transition"
        >
          Delete
        </button>

      </div>

    </div>
  );
}