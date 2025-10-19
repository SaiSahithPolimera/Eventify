import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./components/RequireAuth";
import AddTickets from "./pages/AddTickets";
import AdminDashboard from "./pages/AdminDashboard";
import MyEvents from "./pages/MyEvents";

const routes = [
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/signup",
        element: <Signup />
    },
    {
        path: "/dashboard",
        element:
            <RequireAuth>
                <Dashboard />
            </RequireAuth>
    },
    {
        path: "/my-events",
        element:
            <RequireAuth allowedRoles={["organizer"]}>
                <MyEvents />
            </RequireAuth>
    },
    {
        path: "/events/:id/tickets",
        element:
            <RequireAuth allowedRoles={["organizer"]}>
                <AddTickets />
            </RequireAuth>
    },
    {
        path: "/admin",
        element:
            <RequireAuth allowedRoles={["organizer"]}>
                <AdminDashboard />
            </RequireAuth>
    }
];

export default routes;