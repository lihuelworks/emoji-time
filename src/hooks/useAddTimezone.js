import useSnackbarStore from './stores/snackbarStore';
import useZoneSelectionStore from '../stores/zoneSelectionStore';

export function useAddTimezone(timezoneItem, timezoneSelection) {
    const setIsSnackbarOpen = useSnackbarStore((state) => state.setIsSnackbarOpen);
    const setSnackbarMessage = useSnackbarStore((state) => state.setSnackbarMessage)
    const setSelectionItem = useZoneSelectionStore((state) => state.setSelectionItem);


    if (timezoneItem.redundant) {
        return
    }
    let new_zone_selected_obj = {
        name: timezoneItem.name,
        countryName: timezoneItem.countryName,
        alternativeName: timezoneItem.alternativeName,
        currentTimeOffsetInMinutes: timezoneItem.currentTimeOffsetInMinutes,
        countryFlag: timezoneItem.countryFlag
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
    return
}