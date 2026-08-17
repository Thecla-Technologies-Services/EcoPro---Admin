export function AmountBanner({ amount }: { amount: number }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#2D7A4F] mb-5">
      {/* decorative leaf pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/assets/images/leaf-pattern.png')`,
          backgroundSize: "fill",
          backgroundRepeat: "noRepeat",
          backgroundPosition: "center",
          
        }}
      />
      <div className="relative flex flex-col items-center py-5">
        <span className="text-white/70 text-xs mb-1">Amount</span>
        <span className="text-white text-3xl font-bold">
          {amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
