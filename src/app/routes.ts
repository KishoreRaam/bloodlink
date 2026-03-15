import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { DonorRegistration } from "./pages/DonorRegistration";
import { SearchDonors } from "./pages/SearchDonors";
import { PatientRequest } from "./pages/PatientRequest";
import { DonorProfile } from "./pages/DonorProfile";
import { BloodCamps } from "./pages/BloodCamps";
import { Notifications } from "./pages/Notifications";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "register", Component: DonorRegistration },
      { path: "search", Component: SearchDonors },
      { path: "request", Component: PatientRequest },
      { path: "profile/:id", Component: DonorProfile },
      { path: "profile", Component: DonorProfile },
      { path: "camps", Component: BloodCamps },
      { path: "notifications", Component: Notifications },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
    ],
  },
]);