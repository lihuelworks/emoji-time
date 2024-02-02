/* styles */
import './App.css';
/* libraries */
import { useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
/* stores */
import useClockStore from './stores/clockStore.js';
import useZoneSelectionStore from './stores/zoneSelectionStore.js';
/* utils */
import getFlagEmoji from './utils/getFlagEmoji.js';
/* components */
import TimezoneListComponent from './components/TimezoneListComponent.jsx'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';


function App() {
  if (window.chrome) {
    // console.log("chrome!")
    polyfillCountryFlagEmojis();
  }
  // TODO: remove unnecessary parts of state
  /* useClockStore */
  // timezoneList from tzdb package
  const timezoneList = useClockStore((state) => state.timezoneList);
  // local time data (in state for some reason)
  const currentTimezone = useClockStore((state) => state.currentTimezone);
  const selectedTime = useClockStore((state) => state.selectedTime);
  const setSelectedTime = useClockStore((state) => state.setSelectedTime);

  /* useZoneSelectionStore */
  const timezoneSelection = useZoneSelectionStore((state) => state.selection);
  const setSelectionItem = useZoneSelectionStore((state) => state.setSelectionItem);
  const deleteSelectionItem = useZoneSelectionStore((state) => state.deleteSelectionItem);

  /* local variables */
  // TODO: figure out how to remove this unnecessary state
  const [inputValue, setInputValue] = useState('');
  const [autocompleteState, setAutocompleteState] = useState('');
  let textareaText = "Time not selected yet"
  const textareaRef = useRef(null);

  /* Map to use alternative names in case of repeated countryName (e.g USA EST, PST, etc) */
  const nameOccurrences = {};
  timezoneList.forEach((timezoneItem) => {
    const { countryName } = timezoneItem;
    // console.log(countryName," - ",timezoneItem.alternativeName)
    nameOccurrences[countryName] = (nameOccurrences[countryName] || 0) + 1;
    // console.log("Occurrence ", countryName, nameOccurrences[countryName])
  });


  /* event handlers */
  function handleTimeChange(event) {
    const selectedTimeObject = DateTime.fromFormat(event.target.value, 'HH:mm');
    setSelectedTime(selectedTimeObject);
  }

  function handleTimezoneArrayChange(event, type, reason) {
    console.log("reason!! ", reason)
    console.log("event! ", inputValue)
    console.log("type", type)
    let chosenValue;
    function addTimezone(timezoneItem) {
      // console.log(timezoneItem)
      let new_zone_selected_obj = {
        name: timezoneItem.name,
        countryName: timezoneItem.countryName,
        alternativeName: timezoneItem.alternativeName,
        currentTimeOffsetInMinutes: timezoneItem.currentTimeOffsetInMinutes,
        countryFlag: getFlagEmoji(timezoneItem.countryCode)
      }

      // Check if item is already in selection
      if (timezoneSelection.some(element => element.name === new_zone_selected_obj.name)) {
        alert("Item already in selection!")
        event = ''
        return
      }

      setSelectionItem(new_zone_selected_obj)
      event = ''
      setInputValue('')
      return
    }

    // Delete event
    if (type === "delete") {
      chosenValue = event.target.value;
      console.log("value for delete ", chosenValue)
      deleteSelectionItem(chosenValue)
      return
    }

    // Enter keyup event
    if (type === 'fuzzyAdd') {
      chosenValue = inputValue;
      // console.log("ENTER SPOTTED", chosenValue)
      // chosenValue = chosenValue.replace(/ /g, "_");
      // console.log("after replace", chosenValue)

      const fuzzySelectedTimezone = timezoneList.find(timezoneItem => {
        console.log("currentTimeFormat ", timezoneItem.currentTimeFormat.toLowerCase())
        if (timezoneItem.name.toLowerCase().includes(chosenValue.replace(/ /g, "_")) || timezoneItem.countryName.toLowerCase().includes(chosenValue) || timezoneItem.alternativeName.toLowerCase().includes(chosenValue)) {
          return true
        } else if (timezoneItem.currentTimeFormat.toLowerCase().includes(chosenValue)) {
          return true
        } else {
          return false
        }

      });

      console.log("fuzzySelectedTimezone", fuzzySelectedTimezone)
      if (fuzzySelectedTimezone) {
        addTimezone(fuzzySelectedTimezone)
      }
      setInputValue('')
    }

    // Click event
    chosenValue = event.name;

    const selectedTimezone = timezoneList.find(timezoneItem => timezoneItem.name === chosenValue);
    if (selectedTimezone) {
      addTimezone(selectedTimezone)
      setInputValue('')
    }
  }


  /* Creates the text inside the textarea */
  function createTextareaTimes() {
    // console.log("CREATE TEXTAREA CALLED!")

    if (timezoneSelection.length === 0) {
      return
    }
    const groupedObjects = new Map();
    timezoneSelection.forEach(obj => {
      const offset = obj.currentTimeOffsetInMinutes;

      if (!groupedObjects.has(offset)) {
        groupedObjects.set(offset, []);
      }
      if (nameOccurrences[obj.countryName] > 1) {
        let timezoneItemText = `${obj.countryFlag} ${obj.name.split("/")[1].split("_").join(" ")} (${obj.alternativeName})`
        // console.log("NAMED OCCURENCE SPOTTED IN TEXTAREA", timezonePlusAlternativeName)
        groupedObjects.get(offset).push(timezoneItemText);
      } else {
        groupedObjects.get(offset).push(obj.countryFlag);
      }
    });

    const resultText = [];
    groupedObjects.forEach((timezones, offset) => {
      const formattedTime = selectedTime.plus({ minutes: (offset - selectedTime.offset) }).toFormat('HH:mm');
      const timezoneText = timezones.join(" ");

      // Check if minutes are '00' before appending 'H', otherwise use 'hs'
      const displayTime = formattedTime.endsWith(":00") ? formattedTime.slice(0, -3) + "H" : formattedTime + "hs";

      resultText.push(`${displayTime} ${timezoneText}`);
    });

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
      <p>Your selected time is: </p>
      <h2>{selectedTime.toFormat('HH:mm') || "Time not selected yet"}</h2>

      {/* <hr />
      <h2>👇🏻 Select your timezone:</h2>
      <input type='text' list="timezone-selector" id="timezone-selector-input" name="timezone-selector-input" onChange={(event) => handleTimezoneArrayChange(event, "add")} onKeyUp={(e) => { if (e.key === "Enter") { handleTimezoneArrayChange(e) } }} />
      <datalist id="timezone-selector">
        {timezoneList.map((timezoneItem) => (
          <option key={timezoneItem.name} value={timezoneItem.name}>
            {nameOccurrences[timezoneItem.countryName] > 1 && `${timezoneItem.countryName} - ${timezoneItem.alternativeName}`}
          </option>
        ))}
      </datalist> */}

      <hr />
      <h2>👇🏻 Select your timezone:</h2>
      <h3>(ALT Combo Box)</h3>

      <Autocomplete
        disablePortal
        id="timezone-selector-input"
        options={timezoneList}
        getOptionLabel={(option) => `${getFlagEmoji(option.countryCode)}  ${option.countryName} - ${option.name.split("/")[1].split("_").join(" ")} (${option.alternativeName})`}
        getOptionKey={(option) => option.name}
        /* value */
        inputValue={inputValue}
        /* events */
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue, reason) => handleTimezoneArrayChange(newValue, "add", reason)}
        onKeyUp={(event, newValue) => { if (event.key === "Enter") { handleTimezoneArrayChange(newValue, "fuzzyAdd") } }}
        /* ----- */
        /* renderOption={(props, option) => (
          <Box component="li" {...props}>
            {`${option.countryName} - ${option.alternativeName}`}
          </Box>
        )} */
        renderInput={(params) => <TextField {...params} label="Choose your timezones" />}
      />



      <h2>📃 Current selection: </h2>
      <ul>
        {timezoneSelection.map((timezoneItem) => (
          <button onClick={(event) => handleTimezoneArrayChange(event, "delete")} value={timezoneItem.name} style={{ "listStyle": "none", "textAlign": "left" }} key={timezoneItem.name}>{timezoneItem.countryFlag} {timezoneItem.countryName} {nameOccurrences[timezoneItem.countryName] > 1 && "- " + timezoneItem.name.split("/")[1].split("_").join(" ") + " (" + timezoneItem.alternativeName + ")"}
          </button>
        ))}
      </ul>

      <br />
      <hr />
      <br />
      <h2>📋 Test textarea copy-zone </h2>
      <textarea onClick={handleTextareaCopy} name="timezones-textarea" id="timezones-textarea" cols="30" rows="10" readOnly value={textareaText} ref={textareaRef}>

      </textarea>

      <br />
      <br />

      <button onClick={handleTextareaCopy}> 📋Copy text!</button>

      {/* <TimezoneListComponent /> */}
    </>
  );
}

export default App;
