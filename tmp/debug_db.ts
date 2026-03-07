import { db } from "../lib/db/db";
import { roadmapsTable } from "../lib/db/schema";
import { sql } from "drizzle-orm";

async function debug() {
    try {
        console.log("Checking database connection...");
        const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log("Tables found:", result.rows.map(r => r.table_name));

        const columns = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'roadmaps'`);
        console.log("Columns in 'roadmaps':", columns.rows);

        process.exit(0);
    } catch (err) {
        console.error("Database Debug Error:", err);
        process.exit(1);
    }
}

debug();
