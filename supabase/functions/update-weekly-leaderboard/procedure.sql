-- Cấp quyền sử dụng schema public
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE leaderboards_leaderboard_id_seq TO service_role;

-- Cấp quyền thao tác với tất cả bảng trong schema public
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
DO
$$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.oid::regclass AS seq
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S' AND n.nspname = 'public'
  LOOP
    EXECUTE format('GRANT USAGE, SELECT, UPDATE ON SEQUENCE %s TO service_role', r.seq);
  END LOOP;
END
$$;


CREATE OR REPLACE FUNCTION get_exp_ranking(lb_start timestamp, lb_end timestamp, lb_id int)
RETURNS void AS $$
BEGIN
  DELETE FROM leaderboard_entries WHERE leaderboard_id = lb_id;

  INSERT INTO leaderboard_entries (leaderboard_id, user_id, score, rank, updated_at)
  SELECT
    lb_id,
    user_id,
    SUM((event_data->>'exp')::int),
    RANK() OVER (ORDER BY SUM((event_data->>'exp')::int) DESC),
    NOW()
  FROM event_store
  WHERE event_type = 'exp_gained'
    AND created_at BETWEEN lb_start AND lb_end
  GROUP BY user_id;
END;
$$ LANGUAGE plpgsql;
