export default function CartBar({
  cartCount,
  grandTotal,
  onCheckout,
}: any) {
  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-full max-w-7xl -translate-x-1/2 px-3">
      <button
        onClick={onCheckout}
        className="mx-auto flex w-full items-center justify-between rounded-2xl bg-black px-4 py-4 text-white"
      >
        <div>{cartCount} items</div>
        <div>${grandTotal.toFixed(2)}</div>
      </button>
    </div>
  );
}