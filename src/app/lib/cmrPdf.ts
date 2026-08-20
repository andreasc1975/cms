import { jsPDF } from 'jspdf';
import type { TableRowData } from '../components/TableRow';

// Minimal shape of the two pieces of data this needs from DetailView —
// declared locally instead of importing DetailView's own (non-exported)
// GeneralFormData/ItemLineRow interfaces, to avoid a circular import.
interface GeneralFormDataForPdf {
  controlNo: string;
  declarationType: string;
  countryDispatch: string;
  countryDestination: string;
  deliveryTerms: string;
  deliveryPlace: string;
  locationGoods: string;
}

interface ItemLineRowForPdf {
  description: string;
  packaging: string;
  noOfParcels: string;
  netWeight: string;
  grossWeight: string;
}

/**
 * Generates a CMR-style international waybill PDF, filled in with the
 * declaration's real data, as a Blob ready to upload to the Documents tab.
 * Not a pixel-perfect reproduction of the official form, but follows the
 * same section layout and numbering (1 Sender, 2 Consignee, 5/6-8 marks and
 * packages, etc.) as the reference CMR document.
 */
export function generateCmrPdf(
  record: TableRowData,
  formData: GeneralFormDataForPdf,
  items: ItemLineRowForPdf[]
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 12;
  let y = 14;

  const line = (fromX: number, fromY: number, toX: number, toY: number) => {
    doc.setDrawColor(180);
    doc.line(fromX, fromY, toX, toY);
  };

  const label = (text: string, x: number, yPos: number) => {
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(text, x, yPos);
  };

  const value = (text: string, x: number, yPos: number, size = 10) => {
    doc.setFontSize(size);
    doc.setTextColor(20);
    doc.text(text || '—', x, yPos);
  };

  // Title
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('INTERNATIONAL WAYBILL — CMR', margin, y);
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text(new Date().toLocaleString('en-GB'), pageWidth - margin, y, { align: 'right' });
  y += 4;
  line(margin, y, pageWidth - margin, y);
  y += 8;

  const colWidth = (pageWidth - margin * 2 - 6) / 2;
  const leftX = margin;
  const rightX = margin + colWidth + 6;

  // 1 Sender / 2 Consignee
  label('1. SENDER (NAME, ADDRESS, COUNTRY)', leftX, y);
  label('2. CONSIGNEE (NAME, ADDRESS, COUNTRY)', rightX, y);
  y += 5;
  value(record.consignorName || record.sender?.name || '', leftX, y);
  value(record.consigneeName || record.consignee?.name || '', rightX, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(record.sender?.address || '', leftX, y, { maxWidth: colWidth });
  doc.text(record.consignee?.address || '', rightX, y, { maxWidth: colWidth });
  y += 10;
  line(margin, y, pageWidth - margin, y);
  y += 8;

  // 3 Place/date of taking over / 4 Delivery place
  label('3. PLACE AND DATE OF TAKING OVER THE GOODS', leftX, y);
  label('4. DELIVERY PLACE', rightX, y);
  y += 5;
  value(record.declared || '—', leftX, y);
  value(formData.deliveryPlace || '—', rightX, y);
  y += 8;
  line(margin, y, pageWidth - margin, y);
  y += 8;

  // 5 Marks and 6-8 packages / 9-10 weight+volume
  label('5 MARK AND NO', leftX, y);
  label('6-8 NUMBER AND TYPE OF PACKAGES AND ITEM TYPES', leftX + 45, y);
  label('9 VOLUME (M³)', rightX, y);
  label('10 GROSS WEIGHT (KG)', rightX + 35, y);
  y += 5;

  doc.setFontSize(8);
  doc.setTextColor(30);
  let totalGross = 0;
  items.slice(0, 12).forEach((item) => {
    const parcels = parseFloat(item.noOfParcels) || 0;
    const gross = parseFloat(item.grossWeight) || 0;
    totalGross += gross;
    doc.text(`${parcels || 1} ${item.packaging || 'PK'}: (${item.description || 'Goods'})`, leftX, y, { maxWidth: 85 });
    doc.text(gross.toFixed(2), rightX + 35, y);
    y += 5;
  });
  if (items.length === 0) {
    doc.text('No items registered', leftX, y);
    y += 5;
  }
  y += 2;
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text(`Sum: ${totalGross.toFixed(2)} kg`, rightX + 35, y);
  y += 8;
  line(margin, y, pageWidth - margin, y);
  y += 8;

  // 11 Sender's instructions / 14 To pay
  label("11 SENDER'S INSTRUCTIONS (CUSTOMS AND OTHER FORMALITIES)", leftX, y);
  label('14 TO PAY OF SENDER / CURRENCY TYPE OF CONSIGNEE', rightX, y);
  y += 5;
  value(formData.deliveryTerms || '—', leftX, y);
  value(record.currency || '—', rightX, y);
  y += 8;
  line(margin, y, pageWidth - margin, y);
  y += 8;

  // Customs-specific fields (not on a standard CMR, added for this declaration)
  label('DECLARATION (BOX 1)', leftX, y);
  label('CONTROL NO (BOX 48)', rightX, y);
  y += 5;
  value(formData.declarationType || '—', leftX, y);
  value(formData.controlNo || '—', rightX, y);
  y += 8;
  label('COUNTRY OF DISPATCH (15A)', leftX, y);
  label('COUNTRY OF DESTINATION (17A)', rightX, y);
  y += 5;
  value(formData.countryDispatch || '—', leftX, y);
  value(formData.countryDestination || '—', rightX, y);
  y += 8;
  label('LOCATION OF GOODS (30)', leftX, y);
  label('CUSTOMS RECEIPT NUMBER', rightX, y);
  y += 5;
  value(formData.locationGoods || '—', leftX, y);
  value(record.customsNo || '—', rightX, y);
  y += 12;
  line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(7.5);
  doc.setTextColor(120);
  doc.text(
    'This conveyance is regulated by the Convention on the Contract for the International Carriage of Goods by Road (C.M.R).',
    margin,
    y,
    { maxWidth: pageWidth - margin * 2 }
  );
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(60);
  doc.text('16 Issued place and date', margin, y);
  doc.text(new Date().toLocaleString('en-GB'), margin, y + 5);
  doc.text('17 Carrier signature', margin + 90, y);
  doc.text('18 Goods received (place and date)', margin + 150, y);

  return doc.output('blob');
}