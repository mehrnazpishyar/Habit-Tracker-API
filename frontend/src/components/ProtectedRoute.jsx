import { Navigate } from 'react-router-dom';
import { TOKEN_KEY } from '../api/axiosInstance';

export default function ProtectedRoute({ children }) {
  if (!localStorage.getItem(TOKEN_KEY)) {
    return <Navigate to="/" replace />;
  }

  return children;
}