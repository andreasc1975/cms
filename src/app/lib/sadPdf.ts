import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { TableRowData } from '../components/TableRow';

// Minimal shapes needed — avoids importing DetailView's own (non-exported)
// interfaces, same pattern as cmrPdf.ts.
interface GeneralFormDataForPdf {
  declarationType: string;
}

interface ItemLineRowForPdf {
  description: string;
}

/**
 * Fills the real Norwegian customs declaration form (RD-0019 Enhetsdokument
 * — the actual "Single Administrative Document") with the declaration's
 * data, using the uploaded template PDF as-is rather than a hand-built
 * mockup. Box coordinates below were measured directly from the template's
 * own grid lines (see public/rd-0019-template.pdf), not guessed — but this
 * still isn't pixel-perfect for every box on the form, just the handful
 * that matter most for a useful preview: 1 (Declaration), 2 (Consignor),
 * 8 (Consignee), 31 (goods description), 35/38 (weights), 42 (value).
 */
export async function generateSadPdf(
  record: TableRowData,
  formData: GeneralFormDataForPdf,
  items: ItemLineRowForPdf[]
): Promise<Blob> {
  const templateBytes = await fetch('/rd-0019-template.pdf').then((res) => res.arrayBuffer());
  // Template is pre-decrypted (see public/rd-0019-template.pdf) — the
  // original Tolletaten file was encryption-protected against editing.
  // ignoreEncryption stays as a harmless safety net in case the file is
  // ever swapped back for a still-encrypted version.
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPage(0);
  const { height } = page.getSize();

  // `top` is measured from the top of the page (matching how the template
  // was inspected); pdf-lib's y-axis is bottom-up, so convert per draw call.
  const draw = (text: string, x: number, top: number, size = 8) => {
    if (!text) return;
    page.drawText(text, { x, y: height - top, size, font, color: rgb(0, 0, 0) });
  };

  const wrap = (text: string, maxChars: number): string[] => {
    if (!text) return [];
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxChars) {
        if (current) lines.push(current.trim());
        current = word;
      } else {
        current = (current + ' ' + word).trim();
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  // Box 1 — Declaration (EX / IM / EU / TR)
  draw(formData.declarationType || record.declarationType || '', 362, 65, 9);

  // Box 2 — Avsender/Eksportør (Consignor)
  const consignorName = record.consignorName || record.sender?.name || '';
  const consignorAddress = record.sender?.address || '';
  draw(consignorName, 88, 78, 8);
  wrap(consignorAddress, 30).slice(0, 2).forEach((line, i) => draw(line, 88, 88 + i * 9, 7));

  // Box 8 — Mottaker (Consignee)
  const consigneeName = record.consigneeName || record.consignee?.name || '';
  const consigneeAddress = record.consignee?.address || '';
  draw(consigneeName, 207, 78, 8);
  wrap(consigneeAddress, 22).slice(0, 2).forEach((line, i) => draw(line, 207, 88 + i * 9, 7));

  // Box 31 — Goods description (first item line, since the box preview only
  // shows one representative item rather than the full Items list)
  const firstItem = items[0];
  if (firstItem?.description) {
    wrap(firstItem.description, 55).slice(0, 2).forEach((line, i) => draw(line, 88, 145 + i * 9, 8));
  }

  // Box 35 — Bruttovekt (gross weight)
  draw(record.grossWeight || '0.00', 449, 143, 8);

  // Box 38 — Nettovekt (net weight)
  draw(record.netWeight || '0.00', 449, 165, 8);

  // Box 42 — Varens pris (value)
  draw(record.value || '0.00', 471, 210, 8);

  const pdfBytes = await pdfDoc.save();
  // pdf-lib's .save() returns a Uint8Array typed against the broader
  // ArrayBufferLike, which newer TS DOM typings don't consider assignable
  // to Blob's expected BlobPart — wrapping it in a fresh Uint8Array (backed
  // by a real, non-shared ArrayBuffer) satisfies the stricter type with no
  // change in behavior.
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}