import Card from "../../ui/Card/Card";
import ProgressBar from "../../ui/ProgressBar";

export default function InitiativeProgress({
  initiative,
}) {
  return (
    <Card>

      <ProgressBar
        value={initiative.progress}
      />

    </Card>
  );
}