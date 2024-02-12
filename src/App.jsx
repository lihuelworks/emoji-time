/* libraries */
import { useRef, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
/* stores */
import useClockStore from './stores/clockStore.js';
import useZoneSelectionStore from './stores/zoneSelectionStore.js';
import useSnackbarStore from './stores/snackbarStore.js';
/* utils */
import getFlagEmoji from './utils/getFlagEmoji.js';
import { generateShareString } from './utils/decodeEncodeUrl.js';
import { findTimezone } from './utils/findTimezone.js';
/* hooks */
import useUrlParams from './hooks/useShareParameters.js';
/* constants */
import timezoneTemplates from './constants/timezoneTemplates.js';
/* components */
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Snackbar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
/* MUI related imports */
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Badge from '@mui/material/Badge';


function App() {
  if (window.chrome) {
    polyfillCountryFlagEmojis();
  }
  // TODO: remove unnecessary parts of state
  /* useClockStore */
  // timezoneList from tzdb package
  const timezoneList = useClockStore((state) => state.timezoneList);
  // local time data (in state for some reason)
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

  /* useSnackbarStore */
  const isSnackbarOpen = useSnackbarStore((state) => state.isSnackbarOpen);
  const snackbarMessage = useSnackbarStore((state) => state.snackbarMessage);
  const setIsSnackbarOpen = useSnackbarStore((state) => state.setIsSnackbarOpen);
  const setSnackbarMessage = useSnackbarStore((state) => state.setSnackbarMessage);
  const closeSnackbar = useSnackbarStore((state) => state.closeSnackbar);

  /* local variables and state */
  const pathname = window.location.pathname
  const [currentUrl, setCurrentUrl] = useState(pathname)
  let textareaText = ""
  const textareaRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // For future reference, any time this state (autocompleteKey) is used/set, it's ONLY to reset input value after selection
  // Hate this solution with all my soul, but it's the only way to reliably do it (https://github.com/mui/material-ui/issues/4736)
  const [autocompleteKey, setAutocompleteKey] = useState(0);


  // Map to use alternative names in case of repeated countryName (e.g USA EST, PST, etc)
  // TODO: NAMEOCCURRENCES AUX FUNCTION -> refactor this
  const nameOccurrences = {};
  timezoneList.forEach((timezoneItem) => {
    const { countryName } = timezoneItem;
    // console.log(countryName," - ",timezoneItem.alternativeName)
    nameOccurrences[countryName] = (nameOccurrences[countryName] || 0) + 1;
    // console.log("Occurrence ", countryName, nameOccurrences[countryName])
  });

  // * UTILS functions (move to utils eventually?)
  function addTimezone(timezoneItem) {
    if (timezoneItem.redundant) {
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
      console.log("ALREADY IN SELECTION!")
      return
    }

    setSelectionItem(new_zone_selected_obj)

    setInputValue('')
    return
  }

  /* hook use */
  useUrlParams()

  /* event handlers */

  function handleToggleDialog() {
    setIsDialogOpen(!isDialogOpen)
  }

  function handleUrlCopy() {
    setSnackbarMessage(`Share URL copied!`)
    setIsSnackbarOpen(true)
    let urlFromTimezoneSelection = generateShareString(timezoneSelection)
    console.log("URL GOTTEN", urlFromTimezoneSelection)
    handleCopy(urlFromTimezoneSelection)
  }

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

      const fuzzySelectedTimezone = findTimezone(chosenValue, timezoneList, 'fuzzyAdd');

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
      const selectedTimezone = findTimezone(chosenValue, timezoneList, "selectOption")
      addTimezone(selectedTimezone)
      setInputValue('')
      setAutocompleteKey((prevKey) => prevKey + 1)
    }
  }

  
  // Creates the text inside the textarea
  function createTextareaTimes() {
    // console.log(nameOccurrences)
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
      if (nameOccurrences[obj.countryName] > 1 && (obj.countryName === 'United States' || obj.countryName === 'Brazil' || obj.countryName === 'Argentina')) {
        let timezoneItemText = `${obj.countryFlag} ${obj.name.split("/")[1].split("_").join(" ")} (${obj.alternativeName})`
        // console.log("NAMED OCCURENCE SPOTTED IN TEXTAREA", obj.alternativeName)
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
    // Sort by time (which is the first piece of info in each line), so earlier times show up before later ones
    resultText.sort();


    textareaText = resultText.join('\n')

  }

  createTextareaTimes()

  async function handleCopy(parameter) {
    const text = parameter.current ? parameter.current.value : parameter;
    if (!text) return;

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
        onClick={closeSnackbar}
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
          autoHideDuration={2500}
          disableWindowBlurListener={true}
          onClose={closeSnackbar}
          message={snackbarMessage}
          action={snackbarAction}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />

        <h1 className='project-title'>EMOJI-TIME</h1>
        <h2 htmlFor="time-selector-input">Choose a time for your event: </h2>
        <label hidden htmlFor="time-selector-input">Choose a time for your event: </label>
        <input step="300" value={selectedTime.toFormat('HH:mm') || ''} onChange={handleTimeChange} type="time" id="time-selector-input" name="time-selector-input" required />

        <hr className='section-separator' />

        <details className='template-selection-container'>
          <summary className='template-selection-title'>📃 Templates: </summary>
          <div className='template-selection-content'>
            {Object.entries(timezoneTemplates).map(([templateName, templateData]) => (
              <button key={templateName} title="Click to add countries templates to selection" onClick={() => handleTemplateSelection(templateName)}>
                {templateData.title}
              </button>
            ))}
          </div>
        </details>

        {timezoneSelection.length ?
          <details className='flag-selection-container'>
            <summary
              className={`flag-selection-title ${timezoneSelection.length ? 'slide-fade-in' : 'slide-fade-out'}`}
            >
              <Badge badgeContent={timezoneSelection.length} color="primary">
                🔍 Current selection:
              </Badge>
            </summary>
            <p className='flag-selection secondary-title'>Ordered alphabetically</p>


            <ul className='flag-selection-content'>
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
          placeholder='Time not selected yet, add some timezones to see them here!'
          title="Also click here to copy your text!"
          readOnly

          className={`${textareaText.trim() === '' ? '' : 'timezones-textarea-not-empty'}`}
          onClick={() => handleCopy(textareaRef)}

          name="timezones-textarea"
          id="timezones-textarea"
          value={textareaText}
          ref={textareaRef}

        >

        </TextareaAutosize>

        <button
          disabled={textareaText.trim() === ''}
          className='textarea-copy-button'
          onClick={() => handleCopy(textareaRef)}>
          📋 Copy text!
        </button>
        <div>
          <button
            disabled={textareaText.trim() === ''}
            className='textarea-clear-all-button'
            onClick={() => clearSelection(false)}>Clear all</button>

          <button
            disabled={textareaText.trim() === ''}
            className='textarea-share-button'
            onClick={handleUrlCopy}>Share link!</button>
        </div>

        <footer>Done with {"<3"} by <a href="https://github.com/lihuelworks" rel="noreferrer" target='_blank' >Lihuelworks (Mathias Gomez)</a></footer>
      </ThemeProvider>


    </>
  );
}

export default App;
