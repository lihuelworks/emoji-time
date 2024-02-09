import { create } from 'zustand';
import { getTimeZones } from '@vvo/tzdb';
import { DateTime } from 'luxon';
import getFlagEmoji from '../utils/getFlagEmoji';

let timezoneListArray = getTimeZones()

// Sort the array by alternativeName
timezoneListArray.sort((a, b) => a.countryName.localeCompare(b.countryName));
// Add the countryFlag property to each object
const countryFlagTimezoneList = timezoneListArray.map(item => ({
  ...item,
  countryFlag: getFlagEmoji(item.countryCode), // Assuming countryCode is part of your data
}));

// Filter out timezones with duplicate offsets and country names
const filteredTimezoneList = countryFlagTimezoneList.filter((timezone, index, self) => {
  const hasDuplicate = self.some((otherTimezone, otherIndex) => {
    return (
      index !== otherIndex &&
      timezone.currentTimeOffsetInMinutes === otherTimezone.currentTimeOffsetInMinutes &&
      timezone.countryName === otherTimezone.countryName
    );
  });

  return !hasDuplicate;
});


const useClockStore = create((set) => ({
    timezoneList: filteredTimezoneList,
    currentTime: DateTime.now(),
    selectedTime: DateTime.now(),
    currentTimezone: DateTime.now().zoneName,
    setSelectedTime: (selectedTime) => set({ selectedTime }),
    // selectedTimezone: "",
    // setSelectedTimezone: (selectedTimezone) => set({ selectedTimezone }),
  }));

  export default useClockStore;