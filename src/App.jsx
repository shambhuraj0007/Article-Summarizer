import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Summarize from './pages/Summarize';
import History from './pages/History';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SummaryProvider } from './context/SummaryContext';

function App() {
  return (
    <AuthProvider>
      <SummaryProvider>
        <div className="App">
          <Routes>
            <Route path='/' element={<Navigate to="/login" />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route 
              path='/home' 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/dashboard' 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/summarize' 
              element={
                <ProtectedRoute>
                  <Summarize />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/history' 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
            <Route path='/about' element={<About />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </SummaryProvider>
    </AuthProvider>
  );
}

export default App;
