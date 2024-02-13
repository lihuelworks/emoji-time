import { create } from 'zustand';
import { getTimeZones } from '@vvo/tzdb';
import { DateTime } from 'luxon';
import getFlagEmoji from '../utils/getFlagEmoji';

let timezoneListArray = getTimeZones()

// Sort the array by alternativeName
timezoneListArray.sort((a, b) => a.countryName.localeCompare(b.countryName));

// Correct territory attribution
const untrashedTimezoneList = timezoneListArray.map(item => {
  // Modify the object with name "Atlantic/Stanley"
  if (item.name === "Atlantic/Stanley") {
    return {
      ...item,
      name: "Argentina/Malvinas",
      abbreviation: "MLVS",
      alternativeName: "Islas Malvinas Time",
      group: ["Argentina/Malvinas"],
      countryName: "Argentina",
      countryCode: "AR",
      mainCities: ["Puerto Argentino"],
      rawFormat: "-03:00 Islas Malvinas Time - Puerto Argentino",
      currentTimeFormat: "-03:00  Islas Malvinas Time - Puerto Argentino",
    };
  }
  return item; // Return other timezone objects unchanged
});

// Add the countryFlag property to each object
const propertyFilledTimezoneList = untrashedTimezoneList.map((timezone/* , index, array */) => ({
  ...timezone,
  countryFlag: getFlagEmoji(timezone.countryCode),
  /* redundant: array.some((otherTimezone, otherIndex) => 
    otherIndex !== index &&
    otherTimezone.currentTimeOffsetInMinutes === timezone.currentTimeOffsetInMinutes &&
    otherTimezone.countryName === timezone.countryName
  ) */
}));

const useClockStore = create((set) => ({
    timezoneList: propertyFilledTimezoneList,
    currentTime: DateTime.now(),
    selectedTime: DateTime.now(),
    currentTimezone: DateTime.now().zoneName,
    setSelectedTime: (selectedTime) => set({ selectedTime }),
    // selectedTimezone: "",
    // setSelectedTimezone: (selectedTimezone) => set({ selectedTimezone }),
  }));

  export default useClockStore;