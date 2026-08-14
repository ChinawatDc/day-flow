import QRCode from "qrcode";

export async function InviteQr({ url }: { url: string }) {
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 192 });
  return (
    <div
      className="mx-auto w-48 text-ink [&_svg]:h-full [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
