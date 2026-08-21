import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { TableRowData } from '../components/TableRow';

// Minimal shapes needed — avoids importing DetailView's own (non-exported)
// interfaces, same pattern as cmrPdf.ts.
interface GeneralFormDataForPdf {
  declarationType: string;
}

interface ItemLineRowForPdf {
  description: string;
  statisticalNo?: string;
  origin?: string;
  preferences?: string;
  procedure?: string;
  otherQuantity?: string;
  valuationCode?: string;
  reference?: string;
  adjustment?: string;
  statisticalValue?: string;
}

/**
 * Fills the real Norwegian customs declaration form (RD-0019 Enhetsdokument
 * — the actual "Single Administrative Document") with the declaration's
 * data, using the uploaded template PDF as-is rather than a hand-built
 * mockup. Box coordinates below were measured directly from the template's
 * own grid lines and label positions (see public/rd-0019-template.pdf).
 *
 * Important limitation: several GENERAL fields (boxes 48, 26, 7, 18, 6,
 * 15A, 17A, 20, 21, 25, 29, 30) do NOT appear anywhere on this specific
 * template's page — checked directly against the extracted text. They
 * likely belong on a "BIS" continuation sheet (referenced in the header)
 * that isn't part of this file, so there's no box to draw them into here.
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
  const draw = (text: string | undefined, x: number, top: number, size = 8) => {
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

  // The rest of the item-line boxes (31-46) only show the FIRST item line —
  // same simplification as the description already used, since this is a
  // one-page preview, not a full multi-item rendering.
  const firstItem = items[0];

  // Box 31 — Goods description
  if (firstItem?.description) {
    wrap(firstItem.description, 55).slice(0, 2).forEach((line, i) => draw(line, 88, 145 + i * 9, 8));
  }

  // Box 32 — Varepost (item line number) — just "1" for the first item shown
  if (firstItem) draw('1', 335, 122, 8);

  // Box 33 — Varenummer (statistical/commodity number)
  draw(firstItem?.statisticalNo, 385, 122, 8);

  // Box 34 — Kode opprinnelsesland (country of origin)
  draw(firstItem?.origin, 385, 144, 8);

  // Box 35 — Bruttovekt (gross weight) — declaration total, not per-item
  draw(record.grossWeight || '0.00', 449, 143, 8);

  // Box 36 — Preferanse
  draw(firstItem?.preferences, 528, 144, 8);

  // Box 37 — Prosedyre
  draw(firstItem?.procedure, 385, 166, 8);

  // Box 38 — Nettovekt (net weight) — declaration total, not per-item
  draw(record.netWeight || '0.00', 449, 165, 8);

  // Box 41 — Mengde i annen enhet (other quantity)
  draw(firstItem?.otherQuantity, 385, 209, 8);

  // Box 42 — Varens pris (value) — declaration total, not per-item
  draw(record.value || '0.00', 471, 210, 8);

  // Box 43 — VF (valuation method code)
  draw(firstItem?.valuationCode, 538, 209, 8);

  // Box 44 — Tilleggsopplysninger (additional info / documents produced)
  draw(firstItem?.reference, 75, 212, 7);

  // Box 45 — Justering (adjustment)
  draw(firstItem?.adjustment, 513, 233, 8);

  // Box 46 — Statistisk verdi (statistical value)
  draw(firstItem?.statisticalValue, 479, 255, 8);

  const pdfBytes = await pdfDoc.save();
  // pdf-lib's .save() returns a Uint8Array typed against the broader
  // ArrayBufferLike, which newer TS DOM typings don't consider assignable
  // to Blob's expected BlobPart — wrapping it in a fresh Uint8Array (backed
  // by a real, non-shared ArrayBuffer) satisfies the stricter type with no
  // change in behavior.
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}