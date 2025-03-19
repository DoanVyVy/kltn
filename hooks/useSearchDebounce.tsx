import React from "react";
import { useDebounceValue } from "usehooks-ts";
export default function useSearchDebounce({ defaultValue = "", delay = 500 }) {
	const [search, setSearch] = React.useState(defaultValue);
	const [debouncedValue, setValue] = useDebounceValue(search, delay);
	return {
		debouncedValue,
		value: search,
		setValue: setSearch,
		setDebouncedValue: setValue,
	};
}
