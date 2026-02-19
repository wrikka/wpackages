export const inputConfig = {
	themes: {
		light: {
			textColor: "black",
			bgColor: "white",
			borderColor: "gray",
		},
		dark: {
			textColor: "white",
			bgColor: "black",
			borderColor: "gray",
		},
	},
	text: {
		placeholder: "",
		defaultValue: "",
		color: "white",
		errorColor: "red",
	},
	number: {
		placeholder: "",
		defaultValue: 0,
		min: null,
		max: null,
		step: 1,
	},
	autocomplete: {
		placeholder: "Type to search",
		noMatchesText: "No matches found",
		highlightColor: "cyan",
		initialValue: "",
	},
	confirm: {
		trueText: "Yes",
		falseText: "No",
		defaultText: "(y/n)",
		initialValue: true,
		confirmText: "Confirm",
		cancelText: "Cancel",
	},
	multiselect: {
		maxSelected: null,
		separator: ",",
	},
	search: {
		limit: 10,
		fuzzy: true,
	},
	select: {
		groupSeparator: " > ",
	},
} as const;
