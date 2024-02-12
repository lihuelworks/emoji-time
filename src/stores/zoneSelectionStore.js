import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const useZoneSelectionStore = create(persist((set) => ({
  selection: [],
  setSelectionItem: (newItem) => 
  set((state) => {
    // TODO localCompare tendria q comparar tmb alternative name o countryname o qsyo
    const newSelection = [...state.selection, newItem].sort((a, b) =>
      a.countryName.localeCompare(b.countryName)
    );
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