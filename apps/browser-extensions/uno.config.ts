import {
	defineConfig,
	presetIcons,
	presetWind4,
	transformerDirectives,
	transformerVariantGroup,
	transformerCompileClass,
} from "unocss";

export default defineConfig({
	presets: [
		presetWind4({
			preflights: {
				reset: true,
			},
		}),
		presetIcons({
			scale: 1.2,
			warn: true,
		}),
	],
	theme: {
		colors: {
			background: "hsl(var(--background))",
			foreground: "hsl(var(--foreground))",
			card: {
				DEFAULT: "hsl(var(--card))",
				foreground: "hsl(var(--card-foreground))",
			},
			popover: {
				DEFAULT: "hsl(var(--popover))",
				foreground: "hsl(var(--popover-foreground))",
			},
			primary: {
				DEFAULT: "hsl(var(--primary))",
				foreground: "hsl(var(--primary-foreground))",
			},
			secondary: {
				DEFAULT: "hsl(var(--secondary))",
				foreground: "hsl(var(--secondary-foreground))",
			},
			muted: {
				DEFAULT: "hsl(var(--muted))",
				foreground: "hsl(var(--muted-foreground))",
			},
			accent: {
				DEFAULT: "hsl(var(--accent))",
				foreground: "hsl(var(--accent-foreground))",
			},
			destructive: {
				DEFAULT: "hsl(var(--destructive))",
				foreground: "hsl(var(--destructive-foreground))",
			},
			border: "hsl(var(--border))",
			input: "hsl(var(--input))",
			ring: "hsl(var(--ring))",
			chart: {
				"1": "hsl(var(--chart-1))",
				"2": "hsl(var(--chart-2))",
				"3": "hsl(var(--chart-3))",
				"4": "hsl(var(--chart-4))",
				"5": "hsl(var(--chart-5))",
			},
		},
		animation: {
			keyFrames: {
				"fade-in": "{ from { opacity: 0 } to { opacity: 1 } }",
				"fade-out": "{ from { opacity: 1 } to { opacity: 0 } }",
				"slide-in": "{ from { transform: translateY(10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }",
				"slide-out": "{ from { transform: translateY(0); opacity: 1 } to { transform: translateY(10px); opacity: 0 } }",
				"scale-in": "{ from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }",
				"scale-out": "{ from { transform: scale(1); opacity: 1 } to { transform: scale(0.95); opacity: 0 } }",
				"spin": "{ from { transform: rotate(0deg) } to { transform: rotate(360deg) } }",
				"pulse": "{ 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }",
				"bounce": "{ 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-25%) } }",
			},
			durations: {
				"fade-in": "0.15s",
				"fade-out": "0.15s",
				"slide-in": "0.2s",
				"slide-out": "0.2s",
				"scale-in": "0.15s",
				"scale-out": "0.15s",
				"spin": "1s",
				"pulse": "2s",
				"bounce": "1s",
			},
			timingFns: {
				"fade-in": "ease-out",
				"fade-out": "ease-in",
				"slide-in": "cubic-bezier(0.16, 1, 0.3, 1)",
				"slide-out": "cubic-bezier(0.4, 0, 0.2, 1)",
				"scale-in": "cubic-bezier(0.16, 1, 0.3, 1)",
				"scale-out": "cubic-bezier(0.4, 0, 0.2, 1)",
				"spin": "linear",
				"pulse": "ease-in-out",
				"bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
			},
		},
		spacing: {
			"4.5": "1.125rem",
			"5.5": "1.375rem",
		},
		radius: {
			"sm": "calc(var(--radius) - 4px)",
			"md": "calc(var(--radius) - 2px)",
			"lg": "var(--radius)",
			"xl": "calc(var(--radius) + 4px)",
		},
	},
	shortcuts: {
		"btn": "px-4 py-2 rounded-md font-medium transition-all duration-200 inline-flex items-center justify-center gap-2",
		"btn-primary": "btn bg-primary text-primary-foreground hover:bg-primary/90",
		"btn-secondary": "btn bg-secondary text-secondary-foreground hover:bg-secondary/80",
		"btn-destructive": "btn bg-destructive text-destructive-foreground hover:bg-destructive/90",
		"btn-outline": "btn border border-input bg-background hover:bg-accent hover:text-accent-foreground",
		"btn-ghost": "btn hover:bg-accent hover:text-accent-foreground",
		"input": "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		"card": "rounded-lg border bg-card text-card-foreground shadow-sm",
		"card-header": "flex flex-col space-y-1.5 p-6",
		"card-title": "text-2xl font-semibold leading-none tracking-tight",
		"card-description": "text-sm text-muted-foreground",
		"card-content": "p-6 pt-0",
		"card-footer": "flex items-center p-6 pt-0",
		"badge": "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
		"badge-primary": "badge border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
		"badge-secondary": "badge border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		"badge-outline": "badge text-foreground",
		"tooltip": "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-fade-in",
		"separator": "shrink-0 bg-border h-px w-full",
		"skeleton": "animate-pulse rounded-md bg-muted",
	},
	rules: [
		[/^animate-(fade|slide|scale)-(in|out)$/, ([, type, dir]: any[]) => {
			const keyframe = `${type}-${dir}`;
			return {
				animation: `${keyframe} var(--un-animation-duration, 0.15s) ${dir === 'in' ? 'ease-out' : 'ease-in'}`,
			};
		}],
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
		transformerCompileClass(),
	],
});
