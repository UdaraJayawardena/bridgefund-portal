// Mock data
// import settings from 'data/settings';
import settings from '../settings';

export const getSettings = (limit = 6) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        settings: settings.slice(0, limit),
        settingsTotal: settings.length
      });
    }, 700);
  });
};
