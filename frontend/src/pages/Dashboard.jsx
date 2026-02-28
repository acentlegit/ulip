import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./dashboard/AdminDashboard";
import LawyerDashboard from "./dashboard/LawyerDashboard";
import ParalegalDashboard from "./dashboard/ParalegalDashboard";
import FinanceDashboard from "./dashboard/FinanceDashboard";
import ClientDashboard from "./dashboard/ClientDashboard";
import { UserRoles } from "../constants/roles";

export default function Dashboard() {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case UserRoles.SUPER_ADMIN:
    case UserRoles.ORG_ADMIN:
      return <AdminDashboard />;
    case UserRoles.LAWYER:
      return <LawyerDashboard />;
    case UserRoles.PARALEGAL:
      return <ParalegalDashboard />;
    case UserRoles.FINANCE:
      return <FinanceDashboard />;
    case UserRoles.CLIENT:
      return <ClientDashboard />;
    default:
      return <AdminDashboard />;
  }
}
