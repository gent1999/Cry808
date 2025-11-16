import ReactGA from 'react-ga4';

let isInitialized = false;

export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not found. Analytics will not be tracked.');
    return;
  }

  if (!isInitialized) {
    ReactGA.initialize(measurementId);
    isInitialized = true;
    console.log('Google Analytics initialized');
  }
};

export const logPageView = (path) => {
  if (isInitialized) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const logEvent = (category, action, label = '') => {
  if (isInitialized) {
    ReactGA.event({
      category: category,
      action: action,
      label: label,
    });
  }
};
