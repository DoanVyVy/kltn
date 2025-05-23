import { db } from "@/database";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getCurrentUser() {
	const supabase = createRouteHandlerClient({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return null;
	}

	return {
		user: {
			id: session.user.id,
			email: session.user.email,
			name:
				session.user.user_metadata?.name ||
				session.user.email?.split("@")[0],
			role: session.user.user_metadata?.role || "USER",
		},
	};
}

export async function getCurrentUserId() {
	const user = await getCurrentUser();
	if (!user) {
		return null;
	}
	const userByEmail = await db.user.findFirst({
		where: {
			email: user.user.email,
		},
	});
	if (!userByEmail) {
		return null;
	}
	return userByEmail.userId;
}
