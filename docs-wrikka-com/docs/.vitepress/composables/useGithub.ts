import { computed, ref } from "vue";

const owner = "newkub";
const repo = "learn-wrikka-com";
const token = import.meta.env.VITE_GITHUB_API_TOKEN;
const apiBase = "https://api.github.com";

// ประเภทข้อมูลสำหรับการกรอง commit
export type CommitType =
	| "feature"
	| "fix"
	| "docs"
	| "style"
	| "refactor"
	| "perf"
	| "test"
	| "build"
	| "ci"
	| "chore"
	| "other";

// ประเภทข้อมูลสำหรับ commit จาก GitHub API
export interface GitHubCommit {
	sha: string;
	commit: {
		message: string;
		author: {
			name: string;
			email: string;
			date: string;
		};
	};
	author: {
		login: string;
		avatar_url: string;
		html_url: string;
	};
	html_url: string;
}

// ประเภทข้อมูลสำหรับรายละเอียดไฟล์ที่เปลี่ยนแปลงใน commit
export interface CommitFile {
	filename: string;
	status: string;
	additions: number;
	deletions: number;
	changes: number;
	patch?: string;
	blob_url: string;
	raw_url: string;
	contents_url: string;
}

// ประเภทข้อมูลสำหรับรายละเอียด commit
export interface CommitDetail {
	sha: string;
	commit: {
		message: string;
		author: {
			name: string;
			email: string;
			date: string;
		};
	};
	files: CommitFile[];
	stats: {
		additions: number;
		deletions: number;
		total: number;
	};
	html_url: string;
}

const useGithub = () => {
	// ข้อมูลพื้นฐาน
	const lastCommitDate = ref<Date | null>(null);
	const commits = ref<GitHubCommit[]>([]);
	const commitsLoading = ref(false);
	const commitDetails = ref<Map<string, CommitDetail>>(new Map());
	const error = ref<{ message: string; status?: number } | null>(null);

	// ฟังก์ชันช่วยในการทำ API request ไปยัง GitHub
	const githubFetch = async <T>(
		endpoint: string,
		params: Record<string, string> = {},
	): Promise<T> => {
		const url = new URL(`${apiBase}${endpoint}`);
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.append(key, value);
		}

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `token ${token}`,
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`GitHub API error (${response.status}): ${errorData.message || response.statusText}`,
			);
		}

		return response.json() as Promise<T>;
	};

	// ดึงข้อมูล commit ล่าสุด (คงเดิมจากโค้ดเดิม)
	const fetchLastCommit = async (): Promise<void> => {
		try {
			const data = await githubFetch<GitHubCommit[]>(
				`/repos/${owner}/${repo}/commits`,
				{ per_page: "1" },
			);

			if (data?.[0]?.commit?.author?.date) {
				lastCommitDate.value = new Date(data[0].commit.author.date);
			} else {
				error.value = { message: "No commits found" };
			}
		} catch (err) {
			error.value = {
				message: "Error fetching commit data",
				status: err instanceof Error ? 500 : undefined,
			};
			console.error(err);
		}
	};

	// ดึงข้อมูล commits ทั้งหมด
	const fetchCommits = async (
		page = 1,
		perPage = 30,
	): Promise<GitHubCommit[]> => {
		commitsLoading.value = true;
		error.value = null;

		try {
			const data = await githubFetch<GitHubCommit[]>(
				`/repos/${owner}/${repo}/commits`,
				{
					per_page: perPage.toString(),
					page: page.toString(),
				},
			);

			commits.value = data;
			return data;
		} catch (err) {
			console.error("Error fetching commits:", err);
			error.value = {
				message: err instanceof Error ? err.message : "Error fetching commits",
				status: 500,
			};
			return [];
		} finally {
			commitsLoading.value = false;
		}
	};

	// ดึงข้อมูลรายละเอียดของ commit
	const fetchCommitDetail = async (
		sha: string,
	): Promise<CommitDetail | null> => {
		// ตรวจสอบว่ามีข้อมูลในแคชหรือไม่
		if (commitDetails.value.has(sha)) {
			return commitDetails.value.get(sha) || null;
		}

		try {
			const data = await githubFetch<CommitDetail>(
				`/repos/${owner}/${repo}/commits/${sha}`,
			);
			commitDetails.value.set(sha, data);
			return data;
		} catch (err) {
			console.error(`Error fetching commit detail for ${sha}:`, err);
			error.value = {
				message: `Error fetching commit details: ${err instanceof Error ? err.message : "Unknown error"}`,
				status: 500,
			};
			return null;
		}
	};

	// ฟังก์ชันตรวจสอบประเภทของ commit จากข้อความ
	const getCommitType = (message: string): CommitType => {
		const match = message.match(
			/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\(.*\))?:/i,
		);
		if (match) {
			const type = match[1].toLowerCase();
			if (type === "feat") return "feature";
			return type as CommitType;
		}
		return "other";
	};

	// ฟังก์ชันช่วยจัดรูปแบบวันที่
	const dateFormatOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("th-TH", dateFormatOptions)
			.format(date)
			.replace("เวลา", "เวลา");
	};

	const formattedDate = computed(() => {
		if (!lastCommitDate.value) return "";
		return formatDate(lastCommitDate.value.toISOString());
	});

	const timeAgo = computed(() => {
		if (!lastCommitDate.value) return "";
		const now = Date.now();
		const past = lastCommitDate.value.getTime();
		const diffInSeconds = Math.floor((now - past) / 1000);
		const days = Math.floor(diffInSeconds / (60 * 60 * 24));
		const hours = Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60));
		const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);

		if (days > 0) return `${days} วันที่แล้ว`;
		if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
		if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
		return "เพิ่งอัพเดท";
	});

	// คืนค่าฟังก์ชันและข้อมูลที่เกี่ยวข้อง
	return {
		// ข้อมูลพื้นฐาน
		lastCommitDate,
		commits,
		commitsLoading,
		error,

		// ฟังก์ชันดึงข้อมูล
		fetchLastCommit,
		fetchCommits,
		fetchCommitDetail,
		getCommitType,

		// ฟังก์ชันช่วยจัดรูปแบบ
		formatDate,
		formattedDate,
		timeAgo,
	} as const;
};

export type UseGithubReturn = ReturnType<typeof useGithub>;
export { useGithub };
