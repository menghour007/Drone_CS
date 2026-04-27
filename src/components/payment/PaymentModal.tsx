import { Clock3, Download, X } from 'lucide-react';
import { MERCHANT_NAME } from '../../lib/constants';
import { openBakongDeepLink } from '../../lib/utils';

export default function PaymentModal({ checkout, cart }: any) {
    if (!checkout.isPaymentOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4 lg:p-8">
            <div className="mx-auto my-4 grid min-h-[560px] w-full max-w-6xl overflow-hidden rounded-[28px] bg-[#fafafa] shadow-2xl lg:grid-cols-[1.02fr_0.98fr]">
                <div className="border-b border-slate-200 bg-[#f6f6f6] p-4 sm:p-5 lg:border-b-0 lg:border-r">
                    <div className="mb-4 flex items-center justify-between lg:hidden">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">KHQR Payment</h2>
                            <p className="text-xs text-slate-500">សូមស្កេនដើម្បីបង់ប្រាក់</p>
                        </div>

                        <button
                            onClick={() => {
                                checkout.setIsPaymentOpen(false);
                                checkout.resetPaymentState();
                            }}
                            className="rounded-full p-2 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mx-auto max-w-[350px]">
                        <div className="relative overflow-hidden rounded-[30px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.10)]">
                            <div className="relative bg-[#ee171a] px-2 py-2 text-center text-white">
                                <div className="text-[20px] font-bold tracking-[0.18em]">KHQR</div>
                                <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[40px] border-l-[40px] border-b-transparent border-l-white" />
                            </div>

                            <div className="px-6 pb-6 pt-7 sm:px-8">
                                <div className="text-[17px] font-semibold uppercase tracking-wide text-black sm:text-[18px]">
                                    {MERCHANT_NAME}
                                </div>

                                <div className="mt-3 text-2xl font-black leading-none text-black">
                                    ${cart.grandTotal.toFixed(2)}
                                </div>

                                <div className="my-3 border-t-2 border-dashed border-slate-300" />

                                <div className="bg-white">
                                    {checkout.qrImage ? (
                                        <img
                                            src={checkout.qrImage}
                                            alt="KHQR"
                                            className="mx-auto aspect-square w-full max-w-[280px] object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-[280px] items-center justify-center text-slate-500">
                                            Loading QR...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 rounded-2xl bg-white px-3 py-2 text-center text-sm text-slate-600 shadow-sm">
                            Please scroll down check your order before payment. សូមរើសមើលការបញ្ជាទិញរបស់អ្នកមុនពេលបង់ប្រាក់។
                        </div>

                        <div className="mt-2 flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
                            <div className="text-sm text-slate-500">ពេលនៅសល់</div>

                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                                <Clock3 className="h-4 w-4 text-amber-500" />
                                {checkout.secondsLeft}s
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <button
                                onClick={() => {
                                    const link = checkout.checkoutData?.deepLink;
                                    alert(link || 'NO DEEPLINK');
                                    console.log('DeepLink:', link);
                                    openBakongDeepLink(link);
                                }}
                                disabled={!checkout.checkoutData?.deepLink}
                                className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 font-semibold text-white disabled:opacity-50"
                            >
                                Open Bakong App
                            </button>

                            <button
                                onClick={checkout.downloadQrImage}
                                disabled={!checkout.qrImage}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#111827] font-semibold text-white disabled:opacity-50"
                            >
                                <Download className="h-5 w-5" />
                                Download QR
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-0 flex-col bg-white lg:max-h-[calc(100vh-4rem)]">
                    <div className="hidden items-center justify-between border-b border-slate-200 px-6 py-5 lg:flex">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">KHQR Details</h2>
                            <p className="text-sm text-slate-500">ព័ត៌មានអតិថិជន និងទំនិញ</p>
                        </div>

                        <button
                            onClick={() => {
                                checkout.setIsPaymentOpen(false);
                                checkout.resetPaymentState();
                            }}
                            className="rounded-full p-2 hover:bg-slate-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
                        <div className="space-y-3">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                <div>
                                    <strong>ឈ្មោះ:</strong> {checkout.customerName || '-'}
                                </div>
                                <div>
                                    <strong>លេខទូរស័ព្ទ:</strong> {checkout.customerPhone || '-'}
                                </div>
                                <div>
                                    <strong>អាសយដ្ឋាន:</strong> {checkout.addressText || '-'}
                                </div>
                                <div>
                                    <strong>ខេត្ត:</strong> {checkout.district || '-'}
                                </div>
                                <div>
                                    <strong>សម្គាល់:</strong> {checkout.addressNote || '-'}
                                </div>
                                <div>
                                    <strong>Telegram:</strong>{' '}
                                    {checkout.telegramEnabled ? 'Yes' : 'No'}
                                </div>
                                <div>
                                    <strong>Payment:</strong> {checkout.paymentMethod}
                                </div>
                            </div>

                            {cart.cartItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                                >
                                    <div className="min-w-0 pr-3">
                                        <div className="truncate font-semibold text-slate-800">
                                            {item.name}
                                        </div>

                                        <div className="text-sm text-slate-500">
                                            {item.quantity} × ${item.price.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="font-bold text-slate-800">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </div>
                                </div>
                            ))}

                            <div className="rounded-2xl bg-slate-100 px-4 py-4">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>${cart.subtotal.toFixed(2)}</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span>${cart.shippingFee.toFixed(2)}</span>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-slate-300 pt-3 font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>${cart.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}