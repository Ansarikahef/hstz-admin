const Loader = ({ isLoading = false, title="Loading dashboard",message="Please wait while we prepare your data"}) => {
    if (!isLoading) return null;
  
    return (
      <div className="hz-loader-overlay">
        <div className="hz-loader-card">
  
          {/* Logo / Icon */}
          <div className="hz-loader-logo">
            <div className="hz-loader-circle"></div>
          </div>
  
          {/* Title */}
          <h3 className="hz-loader-title">{title}</h3>
          <p className="hz-loader-sub">{message}</p>
  
          {/* Progress */}
          <div className="hz-loader-progress">
            <div className="hz-loader-progress-bar"></div>
          </div>
  
        </div>
      </div>
    );
  };
  
  export default Loader;