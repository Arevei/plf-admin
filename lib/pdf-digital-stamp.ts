import type { jsPDF } from "jspdf";

export function drawDigitalStamp(
  doc: jsPDF,
  x: number,
  y: number,
  color: [number, number, number] = [11, 74, 127],
) {
  const width = 36;
  const height = 20;
  const left = x - width / 2;
  const top = y - height / 2;

  doc.setDrawColor(...color);
  doc.setLineWidth(0.6);
  doc.roundedRect(left, top, width, height, 1.5, 1.5, "S");
  doc.setLineWidth(0.2);
  doc.roundedRect(left + 1.2, top + 1.2, width - 2.4, height - 2.4, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...color);

  doc.setFontSize(4.8);
  doc.setFontSize(4.2);
  doc.text("PLF", x, top + 4.6, { align: "center" });
  doc.text("PASSION FOR THE LEAST FOUNDATION", x, top + 8, { align: "center", maxWidth: 31 });

  doc.setLineWidth(0.15);
  doc.line(left + 4, top + 10.5, left + width - 4, top + 10.5);

  doc.setFontSize(6.2);
  doc.text("DIGITALLY", x, top + 14.2, { align: "center" });
  doc.text("SIGNED", x, top + 17.2, { align: "center" });
}
