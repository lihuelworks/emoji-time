import './App.css';
import { create } from 'zustand';
import { DateTime } from 'luxon';
import { getTimeZones } from '@vvo/tzdb';

const useClockStore = create((set) => ({
  timezoneList: getTimeZones(),
  currentTime: DateTime.now(),
  selectedTime: DateTime.now(),
  currentTimezone: DateTime.now().zoneName,
  selectedTimezone: "",
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setSelectedTimezone: (selectedTimezone) => set({ selectedTimezone }),
}));

function App() {
  const timezoneList = useClockStore((state) => state.timezoneList);

  const selectedTime = useClockStore((state) => state.selectedTime);

  const currentTimezone = useClockStore((state) => state.currentTimezone);
  const selectedTimezone = useClockStore((state) => state.selectedTimezone);

  const setSelectedTime = useClockStore((state) => state.setSelectedTime);
  const setSelectedTimezone = useClockStore((state) => state.setSelectedTimezone);


  const handleChangeTimezone = (event) => {
    setSelectedTimezone(event.target.value);
  };

  const handleSelectedTimeChange = (event) => {

    const selectedTimeObject = DateTime.fromFormat(event.target.value, 'HH:mm');
    setSelectedTime(selectedTimeObject);
  };

  const groupedTimezonesMap = new Map();

  timezoneList.forEach((timezoneItem) => {
    const offset = timezoneItem.currentTimeOffsetInMinutes;

    if (!groupedTimezonesMap.has(offset)) {
      groupedTimezonesMap.set(offset, []);
    }

    groupedTimezonesMap.get(offset).push(timezoneItem);
  });

  return (
    <>
      <h1>Timezone Clock</h1>
      <h2>⌚ Current Timezone: {currentTimezone}</h2>
      <label htmlFor="appt">Choose a time for your event:</label>
      <br />
      <input value={selectedTime.toFormat('HH:mm') || ''} onChange={handleSelectedTimeChange} type="time" id="appt" name="appt" placeholder='13:00' required />
      <h3>Your selected time is: {selectedTime.toFormat('HH:mm') || "Time not selected yet"}</h3>
      <br />
      <select value={selectedTimezone} onChange={handleChangeTimezone}>
        {timezoneList.map((timezoneItem) => (
          <option key={timezoneItem.name} value={timezoneItem.name}>
            {timezoneItem.name}
          </option>
        ))}
      </select>
      <hr />
      <h2>⌚ Selected Timezone: {selectedTimezone || "No timezone selected yet"} </h2>
      <h3>🔁⌚ Converted time: {selectedTimezone ? selectedTime.setZone(selectedTimezone).toFormat('HH:mm') : "Time not selected yet"}</h3>

      {/* List grouped timezones using Map */}
      <div>
        {[...groupedTimezonesMap.entries()].map(([offset, timezones]) => (
          <div key={offset}>
            <h3>Timezones with Offset {offset}:</h3>
            <ul>
              {timezones.map((timezoneItem) => (
                <li key={timezoneItem.name}>{timezoneItem.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
