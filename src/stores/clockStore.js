import { create } from 'zustand';
import { getTimeZones } from '@vvo/tzdb';
import { DateTime } from 'luxon';
import getFlagEmoji from '../utils/getFlagEmoji';

let timezoneListArray = getTimeZones()

// Sort the array by alternativeName
timezoneListArray.sort((a, b) => a.countryName.localeCompare(b.countryName));
// Add the countryFlag property to each object
const newTimezoneListArray = timezoneListArray.map(item => ({
  ...item,
  countryFlag: getFlagEmoji(item.countryCode), // Assuming countryCode is part of your data
}));

const useClockStore = create((set) => {
  const updateClock = () => {
    set(state => ({
      currentTime: DateTime.now(),
    }));
  };

  // Update the clock every second
  const startClock = () => {
    updateClock(); // Update immediately
    setInterval(updateClock, 1000);
  };

  return {
    timezoneList: newTimezoneListArray,
    currentTime: DateTime.now(),
    selectedTime: DateTime.now(),
    currentTimezone: DateTime.now().zoneName,
    setSelectedTime: (selectedTime) => set({ selectedTime }),
    startClock,
  };
});

  export default useClockStore;