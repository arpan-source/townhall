import PriorityBadge from "../../common/PriorityBadge";
import { formatDate } from "../../../utils/formatDate";
import Card from "../../ui/Card/Card";

export default function InitiativeOverview({
  initiative,
}) {
  return (
    <div className="space-y-6">

      <Card>

        <h3 className="text-sm text-slate-400">
          Overview
        </h3>

        <p className="text-white mt-3 leading-7">
          {initiative.description || "No description provided."}
        </p>

      </Card>

      <div className="grid grid-cols-2 gap-5">

        <Card>

          <p className="text-slate-400">
            Priority
          </p>

          <div className="mt-4">
            <PriorityBadge
              priority={initiative.priority}
            />
          </div>

        </Card>

        <Card>

          <p className="text-slate-400">
            Due Date
          </p>

          <p className="text-white mt-4">
            {formatDate(
              initiative.due_date
            )}
          </p>

        </Card>

      </div>

    </div>
  );
}