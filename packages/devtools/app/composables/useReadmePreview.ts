import MarkdownIt from "markdown-it";
import { ref } from "vue";

export const useReadmePreview = () => {
	const readmeContent = ref("");
	const md = new MarkdownIt();

	const fetchReadme = async () => {
		const markdown =
			"# @wpackages/program\n\nThis is a sample README file.\n\n- Feature 1\n- Feature 2\n";
		readmeContent.value = md.render(markdown);
	};

	return {
		readmeContent,
		fetchReadme,
	};
};
