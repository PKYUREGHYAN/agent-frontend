import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './responsive.css'
import { I18nProvider } from './i18n/I18n.jsx'

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((reg) => reg.unregister());
        }).catch(() => {});
        if (window.caches?.keys) {
            caches.keys().then((keys) => {
                keys.forEach((key) => caches.delete(key));
            }).catch(() => {});
        }
    });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
