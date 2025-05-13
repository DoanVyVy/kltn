import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import dayjs from "https://esm.sh/dayjs";

const supabase = createClient(
	Deno.env.get("SUPABASE_URL")!,
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
	try {
		const yesterday = dayjs().subtract(1, "day").startOf("day");
		const today = dayjs().startOf("day");

		const { data: users, error: userErr } = await supabase
			.from("users")
			.select("user_id, streak_days")
			.gt("streak_days", 0);

		if (userErr) throw userErr;

		for (const user of users) {
			const { user_id: userId, streak_days: streakDays } = user;

			// Kiểm tra xem có event streak_incremented trong ngày hôm qua không
			const { data: streakEvents, error: eventErr } = await supabase
				.from("event_store")
				.select("event_id")
				.eq("user_id", userId)
				.eq("event_type", "streak_incremented")
				.gte("created_at", yesterday.toISOString())
				.lt("created_at", today.toISOString());

			if (eventErr) throw eventErr;

			const hasStreakYesterday = streakEvents && streakEvents.length > 0;

			if (!hasStreakYesterday) {
				// Ghi event streak_broken nếu streak trước đó > 3
				if (streakDays > 3) {
					await supabase.from("event_store").insert({
						user_id: userId,
						event_type: "streak_broken",
						event_data: JSON.stringify({
							previousStreak: streakDays,
						}),
					});
				}

				// Reset streak
				await supabase
					.from("users")
					.update({ streak_days: 0 })
					.eq("user_id", userId);
			}
		}

		return new Response(
			JSON.stringify({ message: "Streak check complete" }),
			{ status: 200 }
		);
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
		});
	}
});
