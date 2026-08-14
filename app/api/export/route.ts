import { NextResponse } from "next/server";
import { exportUserData } from "@/lib/data";
import { getSession } from "@/lib/session";

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";
  const data = await exportUserData(session.user.id);

  if (format === "csv") {
    const kind = url.searchParams.get("kind") ?? "money";
    let header = "";
    let lines: string[] = [];
    if (kind === "tasks") {
      header = "title,note,dueOn,doneAt";
      lines = data.tasks.map((t) =>
        [t.title, t.note, t.dueOn, t.doneAt].map(csvEscape).join(","),
      );
    } else {
      header = "amountSatang,category,merchant,spentOn";
      lines = data.expenses.map((e) =>
        [e.amountSatang, e.category, e.merchant, e.spentOn].map(csvEscape).join(","),
      );
    }
    const body = [header, ...lines].join("\n");
    return new NextResponse(body, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${kind}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="day-flow.json"',
    },
  });
}
