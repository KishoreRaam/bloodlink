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
import { Login } from "./pages/Login";
import { DonorList } from "./pages/DonorList";
import { LandingPage } from "./pages/LandingPage";
import { DonorLogin } from "./pages/DonorLogin";
import { DonorRegister } from "./pages/DonorRegister";
import { DonorDashboard } from "./pages/DonorDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/donor",
    Component: DonorLogin,
  },
  {
    path: "/donor/register",
    Component: DonorRegister,
  },
  {
    path: "/donor/dashboard",
    Component: DonorDashboard,
  },
  {
    path: "/donor/dashboard/:id",
    Component: DonorDashboard,
  },
  {
    path: "/admin",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "register", Component: DonorRegistration },
      { path: "search", Component: SearchDonors },
      { path: "request", Component: PatientRequest },
      { path: "profile/:id", Component: DonorProfile },
      { path: "profile", Component: DonorList },
      { path: "camps", Component: BloodCamps },
      { path: "notifications", Component: Notifications },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
    ],
  },
]);
