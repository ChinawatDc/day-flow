/** Rich menu ของ OA — สร้างใน LINE Official Account Manager ให้ปุ่มตรงกับ postback ด้านล่าง */

export const HUNT_RICHMENU_ACTIONS = [
  { label: "เลือกบ้าน", type: "postback", data: "hunt:open", text: "เลือกบ้าน" },
  { label: "shortlist", type: "postback", data: "hunt:shortlist", text: "shortlist" },
  { label: "นัดดู", type: "postback", data: "hunt:visits", text: "นัดดู" },
] as const;

export function huntPostbackPath(data: string) {
  if (data === "hunt:shortlist") return "/family/hunt/shortlist";
  if (data === "hunt:visits") return "/family/hunt/visits";
  return "/family/hunt";
}
