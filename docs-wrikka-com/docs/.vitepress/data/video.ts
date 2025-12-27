export interface TranscriptItem {
	timestamp: number;
	text: string;
	duration?: number;
}

export interface Chapter {
	id: string;
	title: string;
	timestamp: number;
	duration: number;
}

export interface VideoItem {
	id: string | number;
	title: string;
	description: string;
	thumbnail: string;
	duration: string;
	youtubeId?: string;
	transcript?: Array<{
		timestamp: number;
		text: string;
		duration?: number;
	}>;
	tags?: string[];
	publishedAt?: string;
	viewCount?: number;
	customData?: Record<string, unknown>;
	sources?: Array<{
		src: string;
		type: string;
	}>;
	videoUrl?: string;
	subtitles?: string;
	chapters?: Chapter[];
}

export const videoPlaylist: VideoItem[] = [
	{
		id: "intro-wrikka",
		title: "Introduction to Wrikka",
		description: "Learn the basics of Wrikka platform",
		duration: "5:32",
		thumbnail:
			"https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg",
		youtubeId: "8m8ReerO060",
		chapters: [
			{ id: "welcome", title: "Welcome", timestamp: 0, duration: 30 },
			{
				id: "navigation",
				title: "Basic Navigation",
				timestamp: 30,
				duration: 45,
			},
			{ id: "features", title: "Key Features", timestamp: 75, duration: 120 },
			{ id: "conclusion", title: "Conclusion", timestamp: 215, duration: 97 },
		],
		transcript: [
			{
				timestamp: 0,
				text: "Welcome to Wrikka's comprehensive tutorial series.",
			},
			{
				timestamp: 5,
				text: "In this video, we'll cover the essential features you need to know.",
			},
			{ timestamp: 15, text: "Let's start by exploring the main dashboard." },
			{
				timestamp: 30,
				text: "The navigation menu is located on the left side of the screen.",
			},
			{
				timestamp: 40,
				text: "Here you can access all the main features of the platform.",
			},
			{
				timestamp: 75,
				text: "One of our key features is the task management system.",
			},
			{
				timestamp: 90,
				text: "You can create, assign, and track tasks with ease.",
			},
			{
				timestamp: 120,
				text: "The calendar view helps you stay on top of deadlines.",
			},
			{
				timestamp: 150,
				text: "Team collaboration is simple with our built-in chat.",
			},
			{
				timestamp: 180,
				text: "Upload and share files with your team in real-time.",
			},
			{
				timestamp: 215,
				text: "In conclusion, Wrikka provides all the tools you need.",
			},
			{
				timestamp: 230,
				text: "Start exploring and make the most of our platform.",
			},
		],
	},
	{
		id: "advanced-features",
		title: "Advanced Features",
		description: "Explore advanced features of Wrikka",
		duration: "7:15",
		thumbnail:
			"https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
		youtubeId: "dQw4w9WgXcQ",
		chapters: [
			{
				id: "customization",
				title: "Customization",
				timestamp: 0,
				duration: 60,
			},
			{ id: "automation", title: "Automation", timestamp: 60, duration: 120 },
			{
				id: "integrations",
				title: "Integrations",
				timestamp: 180,
				duration: 105,
			},
			{ id: "analytics", title: "Analytics", timestamp: 285, duration: 150 },
		],
		transcript: [
			{
				timestamp: 0,
				text: "Let's dive into the advanced features of Wrikka.",
			},
			{
				timestamp: 15,
				text: "First, we'll look at customizing your workspace.",
			},
			{ timestamp: 60, text: "Automation can save you hours of manual work." },
			{ timestamp: 90, text: "Set up rules to automate repetitive tasks." },
			{
				timestamp: 120,
				text: "Integrations with other tools you already use.",
			},
			{ timestamp: 150, text: "Connect Wrikka with your favorite apps." },
			{ timestamp: 180, text: "Track your team's performance with analytics." },
			{ timestamp: 210, text: "Generate reports to measure productivity." },
		],
	},
	{
		id: "getting-started",
		title: "Getting Started",
		description: "How to get started with Wrikka",
		duration: "4:20",
		thumbnail:
			"https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
		youtubeId: "9bZkp7q19f0",
		transcript: [],
	},
	{
		id: "dashboard-overview",
		title: "Dashboard Overview",
		description: "Understanding the Wrikka dashboard",
		duration: "6:45",
		thumbnail:
			"https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg",
		youtubeId: "kJQP7kiw5Fk",
		transcript: [],
	},
	{
		id: "project-management",
		title: "Project Management",
		description: "Managing projects with Wrikka",
		duration: "8:30",
		thumbnail:
			"https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
		youtubeId: "JGwWNGJdvx8",
		transcript: [],
	},
	{
		id: "collaboration-tools",
		title: "Collaboration Tools",
		description: "Collaborating with team members",
		duration: "5:10",
		thumbnail:
			"https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg",
		youtubeId: "RgKAFK5djSk",
		transcript: [],
	},
	{
		id: "task-management",
		title: "Task Management",
		description: "How to manage tasks effectively",
		duration: "7:22",
		thumbnail:
			"https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg",
		youtubeId: "OPf0YbXqDm0",
		transcript: [],
	},
	{
		id: "reporting-features",
		title: "Reporting Features",
		description: "Generating reports in Wrikka",
		duration: "6:15",
		thumbnail:
			"https://images.pexels.com/photos/590037/pexels-photo-590037.jpeg",
		youtubeId: "JGwWNGJdvx8",
		transcript: [],
	},
	{
		id: "customization",
		title: "Customization",
		description: "Customizing your Wrikka workspace",
		duration: "5:45",
		thumbnail:
			"https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg",
		youtubeId: "RgKAFK5djSk",
		transcript: [],
	},
	{
		id: "integrations",
		title: "Integrations",
		description: "Connecting Wrikka with other tools",
		duration: "8:10",
		thumbnail:
			"https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
		youtubeId: "9bZkp7q19f0",
		transcript: [],
	},
	{
		id: "mobile-app",
		title: "Mobile App",
		description: "Using Wrikka on mobile devices",
		duration: "4:30",
		thumbnail:
			"https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg",
		youtubeId: "kJQP7kiw5Fk",
		transcript: [],
	},
	{
		id: "security-features",
		title: "Security Features",
		description: "Keeping your data secure",
		duration: "7:50",
		thumbnail:
			"https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg",
		youtubeId: "OPf0YbXqDm0",
		transcript: [],
	},
	{
		id: "troubleshooting",
		title: "Troubleshooting",
		description: "Common issues and solutions",
		duration: "6:25",
		thumbnail:
			"https://images.pexels.com/photos/3568520/pexels-photo-3568520.jpeg",
		youtubeId: "dQw4w9WgXcQ",
		transcript: [],
	},
	{
		id: "best-practices",
		title: "Best Practices",
		description: "Recommended ways to use Wrikka",
		duration: "9:15",
		thumbnail:
			"https://images.pexels.com/photos/3183156/pexels-photo-3183156.jpeg",
		youtubeId: "8m8ReerO060",
		transcript: [],
	},
	{
		id: "case-studies",
		title: "Case Studies",
		description: "Real-world examples of Wrikka usage",
		duration: "10:20",
		thumbnail:
			"https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg",
		youtubeId: "RgKAFK5djSk",
		transcript: [],
	},
	{
		id: "future-updates",
		title: "Future Updates",
		description: "Upcoming features and roadmap",
		duration: "5:45",
		thumbnail:
			"https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg",
		youtubeId: "9bZkp7q19f0",
		transcript: [],
	},
];
