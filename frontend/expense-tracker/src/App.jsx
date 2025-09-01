import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import UserProvider from './context/UserContext'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Expence from './pages/Dashboard/Expence'
import Home from './pages/Dashboard/Home'
import Income from './pages/Dashboard/Income'


const App = () => {
  return (
    <UserProvider>
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expence" element={<Expence />} />
          </Routes>
      </Router>
    </div>
    </UserProvider>
  )
}

export default App

const Root = ()=>{
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}
