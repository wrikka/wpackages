import { ref } from "vue";

const apiKey = import.meta.env.VITE_WORKOS_API_KEY || "";
const defaultClientId = import.meta.env.VITE_WORKOS_CLIENT_ID || "";
const defaultRedirectUri = import.meta.env.VITE_WORKOS_REDIRECT_URI || "";

export interface AuthOptions {
	clientId: string;
	redirectUri: string;
	state?: string;
}

export interface EmailAuthOptions {
	email: string;
	password: string;
	redirectUri?: string;
}

export interface ForgotPasswordOptions {
	email: string;
	redirectUri?: string;
}

export interface WorkOSUser {
	email: string;
	name: string;
}

export interface WorkOSOptions {
	clientId: string;
	redirectUri: string;
}

export default function useWorkOS(
	options: WorkOSOptions = {
		clientId: defaultClientId,
		redirectUri: defaultRedirectUri,
	},
) {
	const user = ref<WorkOSUser | null>(null);
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	const redirectToAuth = (provider: string, isSignUp = false) => {
		const url = new URL("https://api.workos.com/sso/authorize");
		url.searchParams.append("client_id", options.clientId);
		url.searchParams.append("redirect_uri", options.redirectUri);
		url.searchParams.append("response_type", "code");
		url.searchParams.append("provider", provider);
		if (isSignUp) {
			url.searchParams.append("screen", "signup");
		}
		window.location.href = url.toString();
	};

	const signInWithGoogle = () => redirectToAuth("google");
	const signInWithGithub = () => redirectToAuth("github");
	const signUpWithGoogle = () => redirectToAuth("google", true);
	const signUpWithGithub = () => redirectToAuth("github", true);

	// Handle the auth callback when redirected back
	const handleAuthCallback = async () => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");

		if (code) {
			try {
				isLoading.value = true;
				const response = await fetch("/api/auth/callback", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ code }),
				});

				if (!response.ok) throw new Error("Auth failed");
				user.value = await response.json();
			} catch (err) {
				error.value = err as Error;
			} finally {
				isLoading.value = false;
			}
		}
	};

	const getUser = async () => {
		try {
			const response = await fetch("https://api.workos.com/user", {
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch user");
			const data = await response.json();
			user.value = data;
			return data;
		} catch (error) {
			console.error("Failed to get user:", error);
			user.value = null;
			return null;
		}
	};

	const signOut = async () => {
		try {
			const response = await fetch("https://api.workos.com/logout", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			});
			if (!response.ok) throw new Error("Failed to sign out");
			user.value = null;
			return true;
		} catch (error) {
			console.error("Failed to sign out:", error);
			return false;
		}
	};

	const signInWithEmail = async (emailAuthOptions: EmailAuthOptions) => {
		const response = await fetch(
			"https://api.workos.com/passwordless/sessions/email",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					email: emailAuthOptions.email,
					type: "sign_in",
					redirect_uri: emailAuthOptions.redirectUri || options.redirectUri,
				}),
			},
		);
		if (!response.ok) throw new Error("Failed to send sign-in email");
		return await response.json();
	};

	const signUpWithEmail = async (emailAuthOptions: EmailAuthOptions) => {
		const response = await fetch(
			"https://api.workos.com/passwordless/sessions/email",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					email: emailAuthOptions.email,
					type: "sign_up",
					redirect_uri: emailAuthOptions.redirectUri || options.redirectUri,
				}),
			},
		);
		if (!response.ok) throw new Error("Failed to send sign-up email");
		return await response.json();
	};

	const forgotPassword = async (
		forgotPasswordOptions: ForgotPasswordOptions,
	) => {
		const response = await fetch(
			"https://api.workos.com/passwordless/sessions/email",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					email: forgotPasswordOptions.email,
					type: "forgot_password",
					redirect_uri:
						forgotPasswordOptions.redirectUri || options.redirectUri,
				}),
			},
		);
		if (!response.ok) throw new Error("Failed to send password reset email");
		return await response.json();
	};

	return {
		user,
		isLoading,
		error,
		getUser,
		signOut,
		signInWithGoogle,
		signInWithGithub,
		signUpWithGoogle,
		signUpWithGithub,
		signInWithEmail,
		signUpWithEmail,
		forgotPassword,
		handleAuthCallback,
	};
}
