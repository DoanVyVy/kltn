import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dùng biến môi trường từ Supabase
const supabase = createClient(
	Deno.env.get("SUPABASE_URL")!,
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
	const { data: leaderboards, error } = await supabase
		.from("leaderboards")
		.select("*")
		.eq("period_type", "weekly")
		.lte("start_date", new Date().toISOString())
		.gte("end_date", new Date().toISOString());

	if (!leaderboards || leaderboards.length === 0) {
		return new Response("No active leaderboard found", { status: 404 });
	}

	const lb = leaderboards[0];

	const { error: rpcError } = await supabase.rpc("get_exp_ranking", {
		lb_start: lb.start_date,
		lb_end: lb.end_date,
		lb_id: lb.leaderboard_id,
	});

	if (rpcError) {
		console.error(rpcError);
		return new Response("RPC Error", { status: 500 });
	}

	return new Response("Leaderboard updated successfully!");
});
