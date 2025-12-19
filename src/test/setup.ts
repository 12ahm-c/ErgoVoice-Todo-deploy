import '@testing-library/jest-dom'

// mock speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    cancel: () => {},
    speak: () => {},
    pause: () => {},
    resume: () => {},
  },
  writable: true,
});