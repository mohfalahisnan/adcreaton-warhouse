"use client";
import { useEffect, useState } from "react";

/**
 * Custom React hook to evaluate and respond to media queries.
 * @param query - The media query string.
 * @returns True if the media query matches, false otherwise.
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Event listener to update state on change
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener("change", handler);

    // Cleanup function
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
};

export default useMediaQuery;
