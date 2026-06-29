export const environment = {
  production: false,
  apiUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://medical-backend-zz1b.onrender.com/api'
};
