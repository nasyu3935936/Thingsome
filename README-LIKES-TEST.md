Local test steps for `likes` table and realtime behavior

1) Set env vars (create a .env.local in project root):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key   # optional for direct DB operations
```

2) Create the `likes` table:
- Open Supabase dashboard -> SQL Editor -> Run the SQL in `supabase/create_likes_table.sql`.

Or use psql:

```bash
psql "postgresql://postgres:password@db-host:5432/postgres" -f supabase/create_likes_table.sql
```

3) Start the Next.js app locally:

```bash
npm install
npm run dev
```

4) Test the chat like flow:
- Open the app and create two test users in Supabase Auth (or use existing users).
- Create a `chat_rooms` row linking the two user ids (or use the app's matching to create one).
- Open the chat page with `?roomId=<room id>&nickname=테스트`.
- Click the heart button — this triggers insertion into `likes` table.

5) Verify:
- In Supabase Table Editor, check `likes` rows.
- In SQL editor, run: `select * from public.likes order by created_at desc;`
- On the home page, realtime should update `받은 호감` when a like row is inserted for the logged-in user.

Notes:
- Realtime subscriptions require Postgres row-level replication and Supabase Realtime enabled (default on Supabase projects).
- If realtime doesn't trigger, ensure `NEXT_PUBLIC_SUPABASE_URL` points to your Supabase project and the anon key is valid.
- For tests without auth, open chat without login (dev mode) — likes won't be saved in DB in dev mode.
