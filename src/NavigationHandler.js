import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./Utils/navigationService";

function NavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null;
}

export default NavigationHandler;