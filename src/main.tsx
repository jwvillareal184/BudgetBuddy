
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Optional, for Bootstrap components that require JavaScript
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './UserContext';



const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <UserProvider>
    <App />
  </UserProvider>
);

