import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            <Route
              path="/"
              element={(
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              )}
            >
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<PlaceholderPage title="Customers" />} />
              <Route path="products" element={<PlaceholderPage title="Products" />} />
              <Route path="challans" element={<PlaceholderPage title="Challans" />} />
              <Route path="users" element={<PlaceholderPage title="User Management" />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
