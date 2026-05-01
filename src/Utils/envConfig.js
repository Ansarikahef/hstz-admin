const ENV = process.env.REACT_APP_ENV;

console.log("Current ENV:", ENV);
console.log("ALL ENV:", process.env);

const config = {
  API_BASE_URL:
    ENV === "production"
      ? process.env.REACT_APP_API_BASE_URL_PROD
      : process.env.REACT_APP_API_BASE_URL_DEV,

  APP_NAME: process.env.REACT_APP_APP_NAME,
  ENV,
};

export default config;