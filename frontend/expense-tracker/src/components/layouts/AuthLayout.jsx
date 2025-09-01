const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <h2 className="app-title">Expense Tracker</h2>
      <div className="auth-content">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
