import { useRef, useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PaymentSuccessModal({ checkout }: any) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!checkout.showPaymentSuccess) return null;

  const receipt = checkout.receiptOrder;

  async function downloadReceiptPdf() {
    if (!receipt || !receiptRef.current || downloading) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;

      const imgRatio = canvas.width / canvas.height;
      const pageRatio = maxWidth / maxHeight;

      let finalWidth = maxWidth;
      let finalHeight = maxHeight;

      if (imgRatio > pageRatio) {
        finalHeight = maxWidth / imgRatio;
      } else {
        finalWidth = maxHeight * imgRatio;
      }

      const x = (pageWidth - finalWidth) / 2;
      const y = margin;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      const fileName = `receipt-${receipt.paymentId || Date.now()}.pdf`;

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download receipt. Please try using Chrome or Safari.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Payment Successfully
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your payment was completed successfully.
          </p>
        </div>

        <div
          ref={receiptRef}
          style={{
            marginTop: 0,
            background: '#ffffff',
            color: '#111827',
            padding: 16,
            fontFamily: '"Khmer OS Battambang", Arial, sans-serif',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              CS Drone Store
            </h1>

            <p style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>
              វិក្កយបត្រ / Payment Receipt
            </p>

            <p style={{ marginTop: 6, color: '#059669', fontWeight: 700 }}>
              Payment Status: SUCCESS
            </p>
          </div>

          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
            <div>
              <b>Payment ID:</b> {receipt?.paymentId || '-'}
            </div>
            <div>
              <b>Date:</b> {receipt?.date || '-'}
            </div>
          </div>

          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: '#f8fafc',
              borderRadius: 14,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Customer Information
            </div>

            <div>
              <b>Name:</b> {receipt?.customer?.name || '-'}
            </div>
            <div>
              <b>Phone:</b> {receipt?.customer?.phone || '-'}
            </div>
            <div style={{ wordBreak: 'break-word' }}>
              <b>Address:</b> {receipt?.customer?.address || '-'}
            </div>
            <div>
              <b>Province:</b> {receipt?.customer?.district || '-'}
            </div>
            <div>
              <b>Payment:</b> {receipt?.customer?.paymentMethod || '-'}
            </div>
          </div>

          <div style={{ marginTop: 8, fontWeight: 700 }}>
            Order Details
          </div>

          <div style={{ marginTop: 8 }}>
            {receipt?.items?.map((item: any) => (
              <div
                key={item.id}
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: '#64748b', marginTop: 3 }}>
                    {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                </div>

                <div style={{ fontWeight: 700 }}>
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: '#f1f5f9',
              borderRadius: 14,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>${receipt?.subtotal?.toFixed(2) || '0.00'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span>${receipt?.shippingFee?.toFixed(2) || '0.00'}</span>
            </div>

            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              <span>Total</span>
              <span>${receipt?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <p style={{ marginTop: 16, textAlign: 'center', color: '#64748b' }}>
            Thank you for your order!
          </p>
        </div>

        <button
          type="button"
          onClick={downloadReceiptPdf}
          disabled={downloading}
          className="relative z-[10000] mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-semibold text-white disabled:opacity-60"
        >
          <Download className="h-5 w-5" />
          {downloading ? 'Downloading...' : 'Download PDF Receipt'}
        </button>

        <button
          type="button"
          onClick={() => {
            checkout.setShowPaymentSuccess(false);
            checkout.resetAll();
          }}
          className="relative z-[10000] mt-3 h-12 w-full rounded-2xl bg-slate-900 font-semibold text-white"
        >
          Done
        </button>
      </div>
    </div>
  );
}