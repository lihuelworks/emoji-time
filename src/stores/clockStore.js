import { create } from 'zustand';
import { getTimeZones } from '@vvo/tzdb';
import { DateTime } from 'luxon';


const useClockStore = create((set) => ({
    timezoneList: getTimeZones(),
    currentTime: DateTime.now(),
    selectedTime: DateTime.now(),
    currentTimezone: DateTime.now().zoneName,
    setSelectedTime: (selectedTime) => set({ selectedTime }),
    // selectedTimezone: "",
    // setSelectedTimezone: (selectedTimezone) => set({ selectedTimezone }),
  }));

  export default useClockStore;