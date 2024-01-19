import { create } from 'zustand';

const useZoneSelectionStore = create((set) => ({
  selection: [],
  setSelectionItem: (newItem) => set((state) => {
    const newSelection = [...state.selection, newItem];
    return { selection: newSelection };
  }),
  deleteSelectionItem: (itemName) => set((state) => {
    const newSelection = state.selection.filter((item) => item.name !== itemName);
    return { selection: newSelection };
  }),
}));

export default useZoneSelectionStore;