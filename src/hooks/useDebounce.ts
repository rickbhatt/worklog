import { useEffect, useState } from "react";

const useDebounce = ({
  value,
  delay = 500,
}: {
  value: string | null;
  delay?: number;
}) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export { useDebounce };
