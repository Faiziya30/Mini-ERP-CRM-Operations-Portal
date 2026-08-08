import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerFormPage from './pages/CustomerFormPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
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
                <Route
                  path="customers"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'sales']}>
                      <CustomersPage />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="customers/new"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'sales']}>
                      <CustomerFormPage />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="customers/:id"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'sales']}>
                      <CustomerDetailPage />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="customers/:id/edit"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'sales']}>
                      <CustomerFormPage />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="products"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'warehouse']}>
                      <ProductsPage />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="products/new"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'warehouse']}>
                      <ProductFormPage />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="products/:id"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'warehouse']}>
                      <ProductDetailPage />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="products/:id/edit"
                  element={(
                    <PrivateRoute allowedRoles={['admin', 'warehouse']}>
                      <ProductFormPage />
                    </PrivateRoute>
                  )}
                />
                <Route path="challans" element={<PlaceholderPage title="Challans" />} />
                <Route path="users" element={<PlaceholderPage title="User Management" />} />
                <Route path="*" element={<Navigate to="/404" />} />
              </Route>

              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
