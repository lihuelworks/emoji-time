import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

function sortSelection(selection) {
  // This sorting is done mainly for the render on the "Current Selection" section
  return selection.sort((a, b) => {
    // First, sort by countryName
    const countryComparison = a.countryName.localeCompare(b.countryName);
    if (countryComparison !== 0) {
      return countryComparison;
    }

    // If countryName is the same, sort by name (after processing)
    const processedNameA = a.name.split("/")[1].split("_").join(" ");
    const processedNameB = b.name.split("/")[1].split("_").join(" ");
    const nameComparison = processedNameA.localeCompare(processedNameB);
    if (nameComparison !== 0) {
      return nameComparison;
    }

    // If name is the same, sort by alternativeName
    return a.alternativeName.localeCompare(b.alternativeName);
  });
}

const useZoneSelectionStore = create(persist((set) => ({
  selection: [],
  setSelection: (newSelection) => {
    // You can perform any processing you need here before setting the new selection
    const sortedSelection = sortSelection(newSelection);
    set({ selection: sortedSelection });
  },
  setSelectionItem: (newItem) => set((state) => {
    const newSelection = [...state.selection, newItem];
    const sortedSelection = sortSelection(newSelection);
    return { selection: sortedSelection };
  }),
  deleteSelectionItem: (itemName) => set((state) => {
    const newSelection = state.selection.filter((item) => item.name !== itemName);
    return { selection: newSelection };
  }),
  clearSelection: (confirmationFlag) => {
    if (confirmationFlag || window.confirm('Are you sure you want to clear the selection?')) {
      set({ selection: [] });
    }
  },
}),
  {
    name: 'timezone-selection-storage',
    storage: createJSONStorage(() => localStorage),
  }
));

export default useZoneSelectionStore;