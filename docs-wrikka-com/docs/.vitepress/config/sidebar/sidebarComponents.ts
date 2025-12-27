import type { DefaultTheme } from "vitepress";

export default function sidebarUI(): DefaultTheme.SidebarItem[] {
  return [
	{ text: "Overview", link: "/ui/components/overview" },
	{
	  text: "Introduction",
	  collapsed: false,
	  base: "/ui/components/get-started",
	  items: [
		{ text: "Why", link: "/why" },
		{ text: "Design Principles", link: "/design-principles" },
	   
	  ],
	},
	{
	  text: "Get Started",
	  collapsed: false,
	  base: "/projects/koui/get-started",
	  items: [
		{ text: "Prerequisites", link: "/prerequisites" },
		{ text: "Installation", link: "/installation" },
		{ text: "Best Practics", link: "/best-practics" },
	  ],
	},
	{
	  text: "Input",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< Input />", link: "/input" },
		{ text: "< Select />", link: "/select" },
		{ text: "< Checkbox />", link: "/checkbox" },
		{ text: "< Radio />", link: "/radio" },
		{ text: "< Switch />", link: "/switch" },
		{ text: "< Form />", link: "/form" },
		{ text: "< PinInput />", link: "/pin-input" },
		{ text: "< DatePicker />", link: "/date-picker" },
		{ text: "< ColorPicker />", link: "/color-picker" },
		{ text: "< Slider />", link: "/slider" },
		{ text: "< Rating />", link: "/rating" },
	  ],
	},
	{
	  text: "Accessibility",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< Alert />", link: "/alert" },
		{ text: "< Tooltip />", link: "/tooltip" },
		{ text: "< Notification />", link: "/notification" },
		{ text: "< Progress />", link: "/progress" },
		{ text: "< Spinner />", link: "/spinner" },
		{ text: "< Badge />", link: "/badge" },
	  ],
	},
	{
	  text: "Layout",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< Card />", link: "/card" },
		{ text: "< Divider />", link: "/divider" },
		{ text: "< Breadcrumb />", link: "/breadcrumb" },
		{ text: "< Pagination />", link: "/pagination" },
		{ text: "< TableOfContents />", link: "/table-of-contents" },
		{ text: "< Accordion />", link: "/accordion" },
		{ text: "< Collapse />", link: "/collapse" },
		{ text: "< Drawer />", link: "/drawer" },
		{ text: "< Menu />", link: "/menu" },
		{ text: "< Tabs />", link: "/tabs" },
		{ text: "< Stepper />", link: "/stepper" },
		{ text: "< Timeline />", link: "/timeline" },
		{ text: "< Skeleton />", link: "/skeleton" },
		{ text: "< Flex />", link: "/flex" },
		{ text: "< Grid />", link: "/grid" },
	  ],
	},
	{
	  text: "Data Display",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< Table />", link: "/table" },
		{ text: "< Avatar />", link: "/avatar" },
		{ text: "< Tag />", link: "/tag" },
		{ text: "< ImageGallery />", link: "/image-gallery" },
		{ text: "< CodeBlock />", link: "/code-block" },
	  ],
	},
	{
	  text: "Overlays",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< Modal />", link: "/modal" },
		{ text: "< Dropdown />", link: "/dropdown" },
		{ text: "< Popover />", link: "/popover" },
	  ],
	},
	{
	  text: "Charts",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< PieChart />", link: "/pie-chart" },
		{ text: "< BarChart />", link: "/bar-chart" },
		{ text: "< LineChart />", link: "/line-chart" },
		{ text: "< AreaChart />", link: "/area-chart" },
		{ text: "< ScatterChart />", link: "/scatter-chart" },
		{ text: "< RadarChart />", link: "/radar-chart" },
	  ],
	},
	{
	  text: "Navigation",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< Button />", link: "/button" },
		{ text: "< Icon />", link: "/icon" },
	  ],
	},
	{
	  text: "Media",
	  collapsed: false,
	  base: "/ui/components/components",
	  items: [
		{ text: "< Carousel />", link: "/carousel" },
		{ text: "< Browser />", link: "/browser" },
		{ text: "< Terminal />", link: "/terminal" },
		{ text: "< FileTree />", link: "/file-tree" },
	  ],
	},
  ];
}
