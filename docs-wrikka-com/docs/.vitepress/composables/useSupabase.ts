import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/vue";
import { ref, watch } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useSupabase() {
	const isCustomer = ref(false);
	const isLoading = ref(true);
	const { isLoaded, isSignedIn, user } = useUser();

	const checkCustomer = async (emailToCheck?: string): Promise<void> => {
		if (!emailToCheck) {
			isCustomer.value = false;
			isLoading.value = false;
			return;
		}

		isLoading.value = true;
		try {
			const { data, error } = await supabase
				.from("customers")
				.select("*")
				.eq("email", emailToCheck)
				.single();

			if (error && error.code !== "PGRST116") {
				throw error;
			}

			isCustomer.value = !!data;
		} catch (error) {
			console.error("Error checking customer status:", error);
			isCustomer.value = false;
		} finally {
			isLoading.value = false;
		}
	};

	watch(
		() => isSignedIn.value,
		async (newIsSignedIn) => {
			if (isLoaded.value && newIsSignedIn && user.value) {
				await checkCustomer(user.value.primaryEmailAddress?.emailAddress);
			} else if (!newIsSignedIn) {
				isCustomer.value = false;
				isLoading.value = true;
			}
		},
		{ immediate: true },
	);

	return {
		supabase,
		isCustomer,
		isLoading,
	};
}

export default supabase;
