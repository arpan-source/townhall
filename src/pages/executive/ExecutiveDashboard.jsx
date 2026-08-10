import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import ExecutiveBrief from "../../components/executive/ExecutiveBrief";

const sidebar = [
  {
    label: "Executive Dashboard",
    path: "/executive",
  },
  {
    label: "Departments",
    path: "/executive/departments",
  },
  {
    label: "Reports",
    path: "/executive/reports",
  },
];

export default function ExecutiveDashboard() {
  return (
    <AppLayout sidebarItems={sidebar}>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Company-wide insights and strategic decisions."
      />

      <div className="mt-8">
        <ExecutiveBrief />
      </div>
    </AppLayout>
  );
}
