import { useEffect, useState } from 'react';
import { decodeShareString } from '../utils/decodeEncodeUrl';
import useZoneSelectionStore from '../stores/zoneSelectionStore';
import useClockStore from '../stores/clockStore';
import { findTimezone } from '../utils/findTimezone';

export function useUrlParams() {
  const pathname = window.location.pathname;
  const [currentUrl, setCurrentUrl] = useState(pathname);
  const timezoneList = useClockStore((state) => state.timezoneList);
  const setSelection = useZoneSelectionStore((state) => state.setSelection);
  const clearSelection = useZoneSelectionStore((state) => state.clearSelection);

  useEffect(() => {
    // todo see if you can eliminate this by setting initial useState currentUrl to pathname directly
    setCurrentUrl(pathname);
  }, [pathname]);
  
  useEffect(() => {
    const timezonesParam = new URLSearchParams(window.location.search).get('timezones');
  
    if (timezonesParam) {
      // Clear previous made selection
      clearSelection(true);
  
      // Remove 'timezones' query parameter from URL
      const params = new URLSearchParams(window.location.search);
      params.delete('timezones');
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
  
      // Decode the parameter value
      const decodedNames = decodeShareString(timezonesParam);
      let urlTimezonesToAdd = []
  
      // Loop through each decoded name
      decodedNames.forEach(decodedName => {
        const selectedTimezone = findTimezone(decodedName,timezoneList, "selectOption")
  
        if (selectedTimezone) {
          urlTimezonesToAdd = [...urlTimezonesToAdd, selectedTimezone]
        }
      });
      setSelection(urlTimezonesToAdd)
    }
  }, [clearSelection, pathname, setSelection, timezoneList]);


  return currentUrl;
}

export default useUrlParams;
