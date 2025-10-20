import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import routes from "./routes";

const router = createBrowserRouter([
  {
    element: <AuthProvider />,
    children: routes
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;