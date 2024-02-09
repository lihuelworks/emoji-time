/* libraries */
import { useRef, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
/* stores */
import useClockStore from './stores/clockStore.js';
import useZoneSelectionStore from './stores/zoneSelectionStore.js';
/* utils */
import getFlagEmoji from './utils/getFlagEmoji.js';
/* constants */
import timezoneTemplates from './constants/timezoneTemplates.js';
/* components */
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Snackbar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
/*  */
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

function App() {
  if (window.chrome) {
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


  // TODO put this MUI styling on a better place
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  /* useZoneSelectionStore */
  const timezoneSelection = useZoneSelectionStore((state) => state.selection);
  const setSelectionItem = useZoneSelectionStore((state) => state.setSelectionItem);
  const deleteSelectionItem = useZoneSelectionStore((state) => state.deleteSelectionItem);
  const clearSelection = useZoneSelectionStore((state) => state.clearSelection);


  /* local variables / state */
  let textareaText = ""
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

  // addTimezone used for handlers and templates 
  function addTimezone(timezoneItem) {
    // console.log(timezoneItem)
    if(timezoneItem.redundant){
      return
    }
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
      setSnackbarMessage(`${new_zone_selected_obj.countryName} already in selection!`)
      setIsSnackbarOpen(true)

      return
    }

    setSelectionItem(new_zone_selected_obj)

    setInputValue('')
    return
  }


  /* event handlers */
  function handleTimeChange(event) {
    const selectedTimeObject = DateTime.fromFormat(event.target.value, 'HH:mm');
    setSelectedTime(selectedTimeObject);
  }

  function handleTemplateSelection(templateSelection) {
    // console.log(timezoneTemplates[templateSelection].timezones)
    timezoneTemplates[templateSelection].timezones.forEach((timezoneTemplateItem) => {
      const selectedTimezone = timezoneList.find(timezoneItem => timezoneItem.name === timezoneTemplateItem);
      addTimezone(selectedTimezone)
    })

  }

  function handleTimezoneArrayChange(event, type, reason) {
    if (reason === "clear") {
      setAutocompleteKey((prevKey) => prevKey + 1)
      return
    }
    let chosenValue;


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

      // console.log("fuzzySelectedTimezone", fuzzySelectedTimezone)
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
      if (nameOccurrences[obj.countryName] > 1 && (obj.countryName === 'United States' || obj.countryName === 'Brazil')) {
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
    if (!textareaRef.current.value) {
      return
    }
    try {
      await navigator.clipboard.writeText(text);
      // alert("Copied to clipboard!");
      setSnackbarMessage('Text copied to clipboard!')
      setIsSnackbarOpen(true)
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
      <ThemeProvider theme={theme}>
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          action={snackbarAction}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />

        <h1 className='project-title'>EMOJI-TIME</h1>
        <h2 htmlFor="time-selector-input">Choose a time for your event: </h2>
        <label hidden htmlFor="time-selector-input">Choose a time for your event: </label>
        <input step="300" value={selectedTime.toFormat('HH:mm') || ''} onChange={handleTimeChange} type="time" id="time-selector-input" name="time-selector-input" required />

        <hr className='section-separator' />

        <details>
          <summary>📃 Templates: </summary>
          <div className='template-selection'>
            {Object.entries(timezoneTemplates).map(([templateName, templateData]) => (
              <button key={templateName} onClick={() => handleTemplateSelection(templateName)}>
                {templateData.title}
              </button>
            ))}
          </div>
        </details>

        {timezoneSelection.length ?
          <details>
            <summary className='selection-dropdown-title'>
              🔍 Current selection:
            </summary>

            <ul className='flag-selection'>
              {timezoneSelection
              .map((timezoneItem) => (
                <button title="Click to remove from selection" onClick={(event) => handleTimezoneArrayChange(event, "delete")} value={timezoneItem.name} style={{ "listStyle": "none", "textAlign": "left" }} key={timezoneItem.name}>{timezoneItem.countryFlag} {timezoneItem.countryName}{nameOccurrences[timezoneItem.countryName] > 1 && " - " + timezoneItem.name.split("/")[1].split("_").join(" ") + " (" + timezoneItem.alternativeName + ")"}
                </button>
              ))}
            </ul>


          </details> : null}


        <Autocomplete
          id="timezone-selector-input"
          // key: used to reset input value after selecting option (no other way around it)
          key={autocompleteKey}
          disablePortal
          theme={theme}
          options={timezoneList.filter(option => !option.redundant)}
          getOptionLabel={(option) => option.defaultPlaceholder ? option.defaultPlaceholder : `${option.countryFlag} ${option.countryName} - ${option.name.split("/")[1].split("_").join(" ")} (${option.alternativeName})`}
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

        <TextareaAutosize
          placeholder='Time not selected yet'
          title="Also click here to copy your text!"
          readOnly
          minRows={"5"}

          className={`${textareaText.trim() === '' ? '' : 'timezones-textarea-not-empty'}`}
          onClick={handleTextareaCopy}

          name="timezones-textarea"
          id="timezones-textarea"
          value={textareaText}
          ref={textareaRef}

        >

        </TextareaAutosize>

        <button
          disabled={textareaText.trim() === ''}
          className='textarea-copy-button'
          onClick={handleTextareaCopy}>
          📋 Copy text!
        </button>
        <button
          disabled={textareaText.trim() === ''}
          className='textarea-clear-all-button'
          onClick={() => {
            clearSelection()
          }}>Clear all</button>
      </ThemeProvider>


    </>
  );
}

export default App;
