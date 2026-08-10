import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";

export default function InitiativeModal({
  onClose,
  onCreate,
}) {
  const { register, handleSubmit } = useForm();
    const { profile } = useAuth();
  async function submit(values) {

  const payload = {
    ...values,

    progress: Number(values.progress),

    owner_id: profile.id,

    department_id: profile.department_id,
  };

  const error = await onCreate(payload);

  if (!error) {
    onClose();
  }
}

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="w-[650px] bg-slate-900 rounded-xl border border-slate-700 p-8">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-semibold text-white">
            New Initiative
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-6"
        >

          <div>

            <label className="text-slate-300 block mb-2">
              Title
            </label>

            <input
              {...register("title")}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
            />

          </div>

          <div>

            <label className="text-slate-300 block mb-2">
              Description
            </label>

            <textarea
              {...register("description")}
              rows={4}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
            />

          </div>

          <div className="grid grid-cols-2 gap-5">

            <div>

              <label className="text-slate-300 block mb-2">
                Status
              </label>

              <select
                {...register("status")}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>

            </div>

            <div>

              <label className="text-slate-300 block mb-2">
                Progress
              </label>

              <input
                type="number"
                {...register("progress")}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
              />

            </div>

          </div>

          <div>

            <label className="text-slate-300 block mb-2">
              Due Date
            </label>

            <input
              type="date"
              {...register("due_date")}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
            />

          </div>

          <div className="flex justify-end gap-4 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-lg bg-slate-700 text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create Initiative
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}