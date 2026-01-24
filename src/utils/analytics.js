import ReactGA from 'react-ga4';

let isInitialized = false;

export const initGA = () => {
  try {
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
  } catch (error) {
    console.error('Error initializing Google Analytics:', error);
    // Don't throw - allow app to continue without analytics
  }
};

export const logPageView = (path) => {
  try {
    if (isInitialized) {
      ReactGA.send({ hitType: 'pageview', page: path });
    }
  } catch (error) {
    console.error('Error logging page view:', error);
  }
};

export const logEvent = (category, action, label = '') => {
  try {
    if (isInitialized) {
      ReactGA.event({
        category: category,
        action: action,
        label: label,
      });
    }
  } catch (error) {
    console.error('Error logging event:', error);
  }
};
