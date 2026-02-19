import React from "react";

export interface PromptDescriptor<T, P extends object> {
	Component: React.FC<P>;
	props: P;
	initialValue: T;
}
