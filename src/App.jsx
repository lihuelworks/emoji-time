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
  let textareaText = "Time not selected yet"
  const textareaRef = useRef(null);


  /* event handlers */
  function handleTimeChange(event) {
    const selectedTimeObject = DateTime.fromFormat(event.target.value, 'HH:mm');
    setSelectedTime(selectedTimeObject);
  }

  function handleTimezoneArrayChange(event, type) {
    const inputValue = event.target.value;
    function addTimezone(timezoneItem) {
      let new_zone_selected_obj = {
        name: timezoneItem.name,
        currentTimeOffsetInMinutes: timezoneItem.currentTimeOffsetInMinutes,
        countryFlag: getFlagEmoji(timezoneItem.countryCode)
      }

      // Check if item is already in selection
      if (timezoneSelection.some(element => element.name === new_zone_selected_obj.name)) {
        alert("Item already in selection!")
        return
      }

      setSelectedTimezone(event.target.value)
      setSelectionItem(new_zone_selected_obj)

      event.target.value = ''
      return
    }

    // Delete event
    if (type === "delete") {
      setSelectedTimezone(event.target.value)
      deleteSelectionItem(inputValue)
      event.target.value = ''
      return
    }

    // Enter keyup event
    if (event.key === 'Enter') {
      event.preventDefault();
      const fuzzySelectedTimezone = timezoneList.find(timezoneItem => timezoneItem.name.toLowerCase().includes(inputValue));
      if (fuzzySelectedTimezone) {
        addTimezone(fuzzySelectedTimezone)
      }
    }

    // Click event
    const selectedTimezone = timezoneList.find(timezoneItem => timezoneItem.name === inputValue);
    if (selectedTimezone) {
      addTimezone(selectedTimezone)
    }
  }



  function createTextareaTimes() {

    if (timezoneSelection.length === 0) {
      return
    }
    const groupedObjects = new Map();
    timezoneSelection.forEach(obj => {
      const offset = obj.currentTimeOffsetInMinutes;

      if (!groupedObjects.has(offset)) {
        groupedObjects.set(offset, []);
      }

      groupedObjects.get(offset).push(obj.countryFlag);
    });

    const resultText = [];
    groupedObjects.forEach((timezones, offset) => {
      const formattedTime = selectedTime.plus({ minutes: offset }).toFormat('HH:mm');
      const timezoneText = timezones.join(" ");

      // Check if minutes are '00' before appending 'H', otherwise use 'hs'
      const displayTime = formattedTime.endsWith(":00") ? formattedTime.slice(0, -3) + "H" : formattedTime + "hs";

      resultText.push(`${displayTime} ${timezoneText}`);
    });

    console.log(resultText.join('\n'));

    textareaText = resultText.join('\n')




    // selectedTimezone ? selectedTime.setZone(selectedTimezone).toFormat('HH:mm') : "Time not selected yet"

  }

  createTextareaTimes()

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
      <h1>Emoji-time:</h1>
      <h2>⌚ Current Timezone: {currentTimezone}</h2>
      <label htmlFor="time-selector-input">Choose a time for your event: </label>
      <input value={selectedTime.toFormat('HH:mm') || ''} onChange={handleTimeChange} type="time" id="time-selector-input" name="time-selector-input" placeholder='13:00' required />
      <p>Your selected time is: {selectedTime.toFormat('HH:mm') || "Time not selected yet"}</p>

      <hr />
      <h2>👇🏻 Select your timezone:</h2>
      <input list="timezone-selector" id="timezone-selector-input" name="timezone-selector-input" onChange={(event) => handleTimezoneArrayChange(event, "add")} onKeyUp={(e) => { if (e.key === "Enter") { handleTimezoneArrayChange(e) } }} />
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
          <button onClick={(event) => handleTimezoneArrayChange(event, "delete")} value={timezoneItem.name} style={{ "listStyle": "none", "textAlign": "left" }} key={timezoneItem.name}>{timezoneItem.countryFlag}<span> - </span>{timezoneItem.name}
          </button>
        ))}
      </ul>

      <br />
      <hr />
      <br />
      <h2>📋 Test textarea copy-zone </h2>
      <textarea name="timezones-textarea" id="timezones-textarea" cols="30" rows="10" readOnly value={textareaText} ref={textareaRef}>

      </textarea>

      <br />
      <br />

      <button onClick={handleTextareaCopy}> 📋Copy text!</button>

      {/* <TimezoneListComponent /> */}
    </>
  );
}

export default App;
