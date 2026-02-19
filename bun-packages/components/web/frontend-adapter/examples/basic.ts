import { compile } from "../src/compile";
import { el, text } from "../src/types/ir";

const tree = el("div", { class: "container" }, [
	el("h1", {}, [text("Hello")]),
	el("p", {}, [text("Write once")]),
]);

console.log(compile("react", tree));
console.log(compile("vue", tree));
console.log(compile("svelte", tree));
