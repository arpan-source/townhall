import Card from "../../ui/Card/Card";

export default function InitiativeActivity({
  updates,
}) {
  return (
    <div>

      <h2 className="text-xl font-semibold text-white mb-4">
        Activity
      </h2>

      <Card>

        {updates.length === 0 ? (

          <p className="text-slate-400">
            No updates yet.
          </p>

        ) : (

          <div className="space-y-6">

            {updates.map((update) => (

              <div
                key={update.id}
                className="border-l-2 border-indigo-500 pl-4"
              >

                <p className="text-white font-semibold">
                  {update.profiles?.full_name}
                </p>

                <p className="text-indigo-400 text-sm mt-1">
                  {update.progress}% Complete
                </p>

                <p className="text-slate-300 mt-3">
                  {update.message}
                </p>

                {update.blockers && (
                  <div className="mt-3">

                    <p className="text-red-400 text-sm font-semibold">
                      Blockers
                    </p>

                    <p className="text-slate-300">
                      {update.blockers}
                    </p>

                  </div>
                )}

                {update.next_steps && (
                  <div className="mt-3">

                    <p className="text-green-400 text-sm font-semibold">
                      Next Steps
                    </p>

                    <p className="text-slate-300">
                      {update.next_steps}
                    </p>

                  </div>
                )}

              </div>

            ))}

          </div>

        )}

      </Card>

    </div>
  );
}