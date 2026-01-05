import { useDebounce } from "use-debounce";

// Re-export the library's useDebounce hook
// This provides better TypeScript support and additional features from the library
export { useDebounce };

// Also export the debounced callback hook for more advanced use cases
export { useDebouncedCallback } from "use-debounce";
