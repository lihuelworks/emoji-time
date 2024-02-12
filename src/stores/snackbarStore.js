import { create } from 'zustand';

const useSnackbarStore = create((set) => ({
  isSnackbarOpen: false,
  snackbarMessage: '',
  setIsSnackbarOpen: (isOpen) => set({ isSnackbarOpen: isOpen }),
  setSnackbarMessage: (message) => set({ snackbarMessage: message }),
  closeSnackbar: () => set({ isSnackbarOpen: false, snackbarMessage: '' }),
  handleSnackbarClose: (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    set({ isSnackbarOpen: false, snackbarMessage: '' });
  },
}));

export default useSnackbarStore;
