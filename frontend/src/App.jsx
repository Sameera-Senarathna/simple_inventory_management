import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import ItemList from "./pages/ItemList";
import ItemForm from "./pages/ItemForm";
import FillTake from "./pages/FillTake";
import Users from "./pages/Users";
import Layout from "./components/Layout";

// "/surgical/" in production, "/" in dev — strip trailing slash for the router
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<ItemList />} />
            <Route path="items/new" element={<ItemForm />} />
            <Route path="items/:id/edit" element={<ItemForm />} />
            <Route path="fill-take" element={<FillTake />} />
            <Route path="fill-take/:itemId" element={<FillTake />} />
            <Route
              path="users"
              element={
                <PrivateRoute adminOnly>
                  <Users />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
