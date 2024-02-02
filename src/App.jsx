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
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Snackbar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


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

  /* local variables / state */
  let textareaText = "Time not selected yet"
  const textareaRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  // For future reference, any time this state (autocompleteKey) is used/set, it's ONLY to reset input value after selection
  // Hate this solution with all my soul, but it's the only way to reliably do it (https://github.com/mui/material-ui/issues/4736)
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  // Map to use alternative names in case of repeated countryName (e.g USA EST, PST, etc)
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
    if (reason === "clear") {
      setAutocompleteKey((prevKey) => prevKey + 1)
      return
    }
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
        // alert("Item already in selection!")
        setSnackbarMessage('Item already in selection!')
        setIsSnackbarOpen(true)

        return
      }

      setSelectionItem(new_zone_selected_obj)

      setInputValue('')
      return
    }

    // Delete event for selection buttons
    if (type === "delete") {
      chosenValue = event.target.value;
      console.log("value for delete ", chosenValue)
      deleteSelectionItem(chosenValue)
      return
    }

    // ENTER keyup event
    if (type === 'fuzzyAdd') {
      chosenValue = inputValue;
      // console.log("ENTER SPOTTED", chosenValue)
      // chosenValue = chosenValue.replace(/ /g, "_");
      // console.log("after replace", chosenValue)

      const fuzzySelectedTimezone = timezoneList.find(timezoneItem => {
        // console.log("currentTimeFormat ", timezoneItem.currentTimeFormat.toLowerCase())
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
      } else {
        setSnackbarMessage(`No timezone found for "${chosenValue}"`)
        setIsSnackbarOpen(true)
      }
      setInputValue('')
    }

    // Click event
    if (reason === "selectOption") {
      // previously, reason was if "selecteTimezone existed", which will hopefully never be the case as it's always a selectable option.
      // selectOption is a much better candidate as it declares user intent
      chosenValue = event.name;
      const selectedTimezone = timezoneList.find(timezoneItem => timezoneItem.name === chosenValue);
      addTimezone(selectedTimezone)
      setInputValue('')
      setAutocompleteKey((prevKey) => prevKey + 1)
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsSnackbarOpen(false);
    setSnackbarMessage('')
  };


  // Creates the text inside the textarea
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

  // TODO: this is the alert action, move to it's own component to also control styles and message
  const snackbarAction = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackbarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  )

  return (
    <>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={snackbarAction}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <h1>Emoji-time:</h1>
      <h2>⌚ Current Timezone: {currentTimezone}</h2>
      <label htmlFor="time-selector-input">Choose a time for your event: </label>
      <input value={selectedTime.toFormat('HH:mm') || ''} onChange={handleTimeChange} type="time" id="time-selector-input" name="time-selector-input" placeholder='13:00' required />
      <p>Your selected time is: </p>
      <h2>{selectedTime.toFormat('HH:mm') || "Time not selected yet"}</h2>

      <hr />
      <h2>📃 Current selection: </h2>
      <ul>
        {timezoneSelection.map((timezoneItem) => (
          <button onClick={(event) => handleTimezoneArrayChange(event, "delete")} value={timezoneItem.name} style={{ "listStyle": "none", "textAlign": "left" }} key={timezoneItem.name}>{timezoneItem.countryFlag} {timezoneItem.countryName}{nameOccurrences[timezoneItem.countryName] > 1 && " - " + timezoneItem.name.split("/")[1].split("_").join(" ") + " (" + timezoneItem.alternativeName + ")"}
          </button>
        ))}
      </ul>

      <h2>👇🏻 Select your timezone:</h2>
      <h3>(ALT Combo Box)</h3>

      <Autocomplete
        // key: used to reset input value after selecting option (no other way around it)
        key={autocompleteKey}
        disablePortal
        id="timezone-selector-input"
        options={timezoneList}
        getOptionLabel={(option) => option.defaultPlaceholder ? option.defaultPlaceholder : `${option.countryName} - ${option.name.split("/")[1].split("_").join(" ")} (${option.alternativeName})`}
        getOptionKey={(option) => option.name}
        /* value */
        inputValue={inputValue}
        /* events */
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue, reason) => handleTimezoneArrayChange(newValue, "add", reason)}
        onKeyUp={(event, newValue) => { if (event.key === "Enter") { handleTimezoneArrayChange(newValue, "fuzzyAdd") } }}
        renderInput={(params) => <TextField {...params} label="Choose your timezones" />}
      />




      <br />
      <hr />
      <br />
      <h2>📋 Test textarea copy-zone </h2>
      <textarea onClick={handleTextareaCopy} name="timezones-textarea" id="timezones-textarea" cols="30" rows="10" readOnly value={textareaText} ref={textareaRef}>

      </textarea>

      <br />
      <br />

      <button onClick={handleTextareaCopy}> 📋Copy text!</button>

    </>
  );
}

export default App;
