import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const useZoneSelectionStore = create(persist((set) => ({
  selection: [],
  setSelectionItem: (newItem) => 
  set((state) => {
    // This sorting is done mainly for the render on the "Current Selection" section
    const newSelection = [...state.selection, newItem].sort((a, b) => {
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
    return { selection: newSelection };
  }),
  deleteSelectionItem: (itemName) => set((state) => {
    const newSelection = state.selection.filter((item) => item.name !== itemName);
    return { selection: newSelection };
  }),
  clearSelection: () => {
    if (window.confirm('Are you sure you want to clear the selection?')) {
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