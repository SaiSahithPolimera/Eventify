import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const RequireAuth = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Required role:</span>{' '}
                            <span className="text-rose-600">{allowedRoles.join(' or ')}</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            <span className="font-semibold">Your role:</span>{' '}
                            <span className="text-gray-900">{user.role}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default RequireAuth;