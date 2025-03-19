import "server-only";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getCurrentUser() {
	const supabase = createRouteHandlerClient({ cookies });
	const { data: user, error } = await supabase.auth.getUser();
	if (error) {
		return null;
	}
	return user;
}
