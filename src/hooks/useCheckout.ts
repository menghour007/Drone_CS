import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type {
    CartItem,
    CheckoutResponse,
    PaymentMethod,
    PaymentStatus,
} from '../lib/types';
import { PAYMENT_TIMEOUT_SECONDS, SHIPPING_FEE } from '../lib/constants';

type Props = {
    cartItems: CartItem[];
    grandTotal: number;
    clearCart: () => void;
};

export function useCheckout({ cartItems, grandTotal, clearCart }: Props) {
    const [isCheckoutFormOpen, setIsCheckoutFormOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
    const [receiptOrder, setReceiptOrder] = useState<any>(null);

    const [qrImage, setQrImage] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('IDLE');
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [district, setDistrict] = useState('');
    const [addressNote, setAddressNote] = useState('');
    const [telegramEnabled, setTelegramEnabled] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ABA_KHQR');

    const [addressText, setAddressText] = useState('');
    const [selectedLat, setSelectedLat] = useState<number | null>(null);
    const [selectedLng, setSelectedLng] = useState<number | null>(null);

    function resetPaymentState() {
        setCheckoutData(null);
        setQrImage('');
        setPaymentStatus('IDLE');
        setCheckoutError('');
        setLoadingCheckout(false);
        setSecondsLeft(PAYMENT_TIMEOUT_SECONDS);
        setShowPaymentSuccess(false);
    }

    function resetCustomerForm() {
        setCustomerName('');
        setCustomerPhone('');
        setDistrict('');
        setAddressNote('');
        setTelegramEnabled(true);
        setPaymentMethod('ABA_KHQR');
        setAddressText('');
        setSelectedLat(null);
        setSelectedLng(null);
    }

    function resetAll() {
        resetPaymentState();
        resetCustomerForm();
        setReceiptOrder(null);
        setIsCheckoutFormOpen(false);
        setIsPaymentOpen(false);
        setIsMapOpen(false);
    }

    function closeCheckoutForm() {
        setCheckoutError('');
        setIsCheckoutFormOpen(false);
    }

    function closePaymentModal() {
        setIsPaymentOpen(false);
        resetPaymentState();
    }

    function downloadQrImage() {
        if (!qrImage) return;

        const link = document.createElement('a');
        link.href = qrImage;
        link.download = `bakong-khqr-${checkoutData?.paymentId || 'payment'}.png`;
        link.click();
    }

    function validateCheckoutForm() {
        const cleanName = customerName.trim();
        const cleanPhone = customerPhone.replace(/\s/g, '');
        const cleanAddress = addressText.trim();

        if (cartItems.length === 0) {
            setCheckoutError('Cart is empty');
            return false;
        }

        if (!cleanName) {
            setCheckoutError('សូមបញ្ចូលឈ្មោះ');
            return false;
        }

        if (cleanName.length < 2) {
            setCheckoutError('ឈ្មោះខ្លីពេក');
            return false;
        }

        if (!cleanPhone) {
            setCheckoutError('សូមបញ្ចូលលេខទូរស័ព្ទ');
            return false;
        }

        if (!/^[0-9+]{8,10}$/.test(cleanPhone)) {
            setCheckoutError('លេខទូរស័ព្ទមិនត្រឹមត្រូវ');
            return false;
        }

        if (!cleanAddress) {
            setCheckoutError('សូមជ្រើសរើសអាសយដ្ឋាន');
            return false;
        }

        setCheckoutError('');
        return true;
    }

    async function submitCheckoutForm() {
        if (!validateCheckoutForm()) return;

        try {
            setLoadingCheckout(true);
            setCheckoutError('');
            setPaymentStatus('IDLE');
            setQrImage('');
            setReceiptOrder(null);

            const orderId = `ORDER-${Date.now()}`;

            const res = await fetch('/api/generate-khqr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(grandTotal.toFixed(2)),
                    currency: 'USD',
                    description: orderId,
                    items: cartItems.map((item) => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Failed to generate KHQR');
            }

            setCheckoutData(data);
            setPaymentStatus('PENDING');
            setSecondsLeft(PAYMENT_TIMEOUT_SECONDS);
            setIsCheckoutFormOpen(false);
            setIsPaymentOpen(true);
        } catch (error: any) {
            setCheckoutError(error?.message || 'Checkout failed');
        } finally {
            setLoadingCheckout(false);
        }
    }

    async function reverseGeocode(lat: number, lng: number) {
        try {
            const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
            const data = await res.json();

            setAddressText(data?.address || `${lat}, ${lng}`);
        } catch {
            setAddressText(`${lat}, ${lng}`);
        }
    }

    useEffect(() => {
        if (!checkoutData?.qrString) return;

        QRCode.toDataURL(checkoutData.qrString, {
            width: 520,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        }).then(setQrImage);
    }, [checkoutData]);

    useEffect(() => {
        if (!isPaymentOpen || paymentStatus !== 'PENDING') return;

        const timer = setInterval(() => {
            setSecondsLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaymentOpen, paymentStatus]);

    useEffect(() => {
        if (!isPaymentOpen) return;
        if (paymentStatus !== 'PENDING') return;
        if (secondsLeft > 0) return;

        setPaymentStatus('EXPIRED');
    }, [secondsLeft, paymentStatus, isPaymentOpen]);

    useEffect(() => {
        if (!checkoutData?.paymentId || !isPaymentOpen || paymentStatus !== 'PENDING') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/check-status/${checkoutData.paymentId}`);
                const data = await res.json();

                if (data?.status === 'COMPLETED') {
                    setPaymentStatus('COMPLETED');

                    const subtotal = cartItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );

                    const shippingFee = cartItems.length > 0 ? SHIPPING_FEE : 0;

                    const receiptSnapshot = {
                        paymentId: checkoutData.paymentId,
                        date: new Date().toLocaleString(),
                        customer: {
                            name: customerName.trim(),
                            phone: customerPhone.trim(),
                            address: addressText,
                            district,
                            addressNote,
                            paymentMethod,
                        },
                        items: cartItems.map((item) => ({ ...item })),
                        subtotal,
                        shippingFee,
                        total: subtotal + shippingFee,
                    };

                    setReceiptOrder(receiptSnapshot);
                    setShowPaymentSuccess(true);
                    setIsPaymentOpen(false);

                    clearCart();
                    clearInterval(interval);

                    fetch('/api/notify-telegram', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paymentId: checkoutData.paymentId,
                            customer: {
                                name: customerName.trim(),
                                phone: customerPhone.trim(),
                                province: addressText,
                                district,
                                addressNote,
                                telegramEnabled,
                                paymentMethod,
                                lat: selectedLat,
                                lng: selectedLng,
                            },
                        }),
                    }).catch((error) => {
                        console.error('Telegram notify failed:', error);
                    });

                    return;
                }

                if (data?.status === 'EXPIRED') {
                    setPaymentStatus('EXPIRED');
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Status check failed:', error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [
        checkoutData,
        isPaymentOpen,
        paymentStatus,
        customerName,
        customerPhone,
        addressText,
        district,
        addressNote,
        telegramEnabled,
        paymentMethod,
        selectedLat,
        selectedLng,
        cartItems,
        clearCart,
    ]);

    return {
        isCheckoutFormOpen,
        setIsCheckoutFormOpen,
        isPaymentOpen,
        setIsPaymentOpen,
        isMapOpen,
        setIsMapOpen,

        checkoutData,
        receiptOrder,
        qrImage,
        paymentStatus,
        loadingCheckout,
        checkoutError,
        secondsLeft,
        showPaymentSuccess,
        setShowPaymentSuccess,

        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        district,
        setDistrict,
        addressNote,
        setAddressNote,
        telegramEnabled,
        setTelegramEnabled,
        paymentMethod,
        setPaymentMethod,

        addressText,
        setAddressText,
        selectedLat,
        setSelectedLat,
        selectedLng,
        setSelectedLng,

        submitCheckoutForm,
        reverseGeocode,
        downloadQrImage,
        resetPaymentState,
        resetAll,
        closeCheckoutForm,
        closePaymentModal,
    };
}