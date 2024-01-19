/* styles */
import './App.css';
/* libraries */
import { useRef } from 'react';
import { DateTime } from 'luxon';
/* stores */
import useClockStore from './stores/clockStore.js';
import useZoneSelectionStore from './stores/zoneSelectionStore.js';
/* utils */
import getFlagEmoji from './utils/getFlagEmoji.js';
/* components */
import TimezoneListComponent from './components/TimezoneListComponent.jsx'

function App() {
  /* useClockStore */
  const timezoneList = useClockStore((state) => state.timezoneList);
  const selectedTime = useClockStore((state) => state.selectedTime);
  //  current vs selected timezone for testing on initial mvp 
  const currentTimezone = useClockStore((state) => state.currentTimezone);
  const selectedTimezone = useClockStore((state) => state.selectedTimezone);
  // 
  const setSelectedTime = useClockStore((state) => state.setSelectedTime);
  const setSelectedTimezone = useClockStore((state) => state.setSelectedTimezone);

  /* useZoneSelectionStore */
  const timezoneSelection = useZoneSelectionStore((state) => state.selection);
  const setSelectionItem = useZoneSelectionStore((state) => state.setSelectionItem);
  const deleteSelectionItem = useZoneSelectionStore((state) => state.deleteSelectionItem);


  /* local variables */
  const textareaRef = useRef(null);


  /* event handlers */
  function handleTimeChange(event) {
    const selectedTimeObject = DateTime.fromFormat(event.target.value, 'HH:mm');
    setSelectedTime(selectedTimeObject);
  }

  function handleTimezoneChange(event) {
    const inputValue = event.target.value;
    const isValidOption = timezoneList.some(timezoneItem => timezoneItem.name === inputValue);

    if (isValidOption) {
      setSelectedTimezone(event.target.value);
    }

    return;
  }

  function handleTimezoneArrayChange(event) {
    /* build flag based on selected time */
    /* build object based on zone */
    /* let new_zone_selected_obj = {
      name: e.
    } */

    const inputValue = event.target.value;

    const selectedTimezone = timezoneList.find(timezoneItem => timezoneItem.name === inputValue);


    if (selectedTimezone) {
      let new_zone_selected_obj = {
        name: selectedTimezone.name,
        currentTimeOffsetInMinutes: selectedTimezone.currentTimeOffsetInMinutes,
        countryFlag: getFlagEmoji(selectedTimezone.countryCode)
      }

      setSelectedTimezone(event.target.value)
      setSelectionItem(new_zone_selected_obj)
      event.target.value = ''
    }



    return;
  }

  async function handleTextareaCopy() {
    const text = textareaRef.current.value;
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error(
        "Unable to copy to clipboard.",
        err
      );
      alert("Copy to clipboard failed.");
    }
  }

  return (
    <>
      <h1>Timezone Clock</h1>
      <h2>⌚ Current Timezone: {currentTimezone}</h2>
      <label htmlFor="time-selector-input">Choose a time for your event: </label>
      <input value={selectedTime.toFormat('HH:mm') || ''} onChange={handleTimeChange} type="time" id="time-selector-input" name="time-selector-input" placeholder='13:00' required />
      <p>Your selected time is: {selectedTime.toFormat('HH:mm') || "Time not selected yet"}</p>

      <hr />
      <h2>👇🏻 Select your timezone:</h2>
      <input list="timezone-selector" id="timezone-selector-input" name="timezone-selector-input" onChange={handleTimezoneArrayChange} />
      <datalist id="timezone-selector">
        {timezoneList.map((timezoneItem) => (
          <option key={timezoneItem.name} value={timezoneItem.name}>
            {timezoneItem.name}
          </option>
        ))}
      </datalist>

      <br />
      <br />

      <h2>📃 Current selection: </h2>
      <ul>
        {timezoneSelection.map((timezoneItem) => (
          <li style={{ "listStyle": "none", "textAlign": "left" }} key={timezoneItem.name}>{timezoneItem.name} <span>— {timezoneItem.currentTimeOffsetInMinutes}</span> <span>— {timezoneItem.countryFlag}</span>
          </li>
        ))}
      </ul>

      <br />
      <hr />
      <br />
      <h2>📋 Test textarea copy-zone </h2>
      <textarea name="timezones-textarea" id="timezones-textarea" cols="30" rows="10" readOnly value={selectedTimezone ? selectedTime.setZone(selectedTimezone).toFormat('HH:mm') : "Time not selected yet"} ref={textareaRef}>

      </textarea>

      <br />
      <br />

      <button onClick={handleTextareaCopy}> 📋Copy text!</button>

      {/* <TimezoneListComponent /> */}
    </>
  );
}

export default App;
