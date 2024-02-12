export function findTimezone(value, searchList, searchType) {
    // Normal search using exact name match
    if (searchType === 'selectOption') {
      const selectedTimezone = searchList.find(timezoneItem => timezoneItem.name === value);
      if (selectedTimezone) return selectedTimezone;
    }
  
    // Fuzzy search
    return searchList.find(timezoneItem => {
      if (searchType === 'fuzzyAdd') {
        if (timezoneItem.name.toLowerCase().includes(value.replace(/ /g, "_")) ||
          timezoneItem.countryName.toLowerCase().includes(value) ||
          timezoneItem.alternativeName.toLowerCase().includes(value) ||
          timezoneItem.currentTimeFormat.toLowerCase().includes(value)) {
          return true;
        }
      } else {
        // Default to fuzzy search if searchType is not 'selectOption'
        if (timezoneItem.name.toLowerCase().includes(value.replace(/ /g, "_")) ||
          timezoneItem.countryName.toLowerCase().includes(value) ||
          timezoneItem.alternativeName.toLowerCase().includes(value) ||
          timezoneItem.currentTimeFormat.toLowerCase().includes(value)) {
          return true;
        }
      }
      return false;
    });
  }
