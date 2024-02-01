/* eslint-disable react/prop-types */
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import useClockStore from '../stores/clockStore.js';



function ComboBox({ optionList }) {
    const nameOccurrences = {};
    const timezoneList = useClockStore((state) => state.timezoneList);
    timezoneList.forEach((timezoneItem) => {
        const { countryName } = timezoneItem;
        // console.log(countryName," - ",timezoneItem.alternativeName)
        nameOccurrences[countryName] = (nameOccurrences[countryName] || 0) + 1;
        // console.log("Occurrence ", countryName, nameOccurrences[countryName])
    });
    return (
        <Autocomplete
            disablePortal
            id="combo-box-demo"
            value={option.name}
            options={optionList}
            getOptionLabel={(option) => option.name}
            sx={{ width: 500 }}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    {`${option.countryName} - ${option.alternativeName}`}
                </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Choose your timezones" />}
        />
    );
}

export default ComboBox;