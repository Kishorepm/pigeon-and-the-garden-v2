type Pose = "stand" | "walk" | "sit";

type FigProps = {
  className?: string;
  outfit?: string;
  pose?: Pose;
  basket?: boolean;
};

export function Him({ className = "", outfit = "#4a6f8a", pose = "stand", basket = false }: FigProps) {
  return (
    <div className={`relative h-[74px] w-[52px] ${pose === "walk" ? "walk-bob" : ""} ${className}`} aria-hidden>
      <div className="bg-hair absolute top-0 left-[13px] h-[10px] w-[26px]" />
      <div className="bg-hair absolute top-2 left-[11px] h-2 w-[30px]" />
      <div className="bg-skin-him absolute top-[14px] left-4 h-4 w-5" />
      <div className="bg-ink absolute top-[21px] left-5 h-[3px] w-[3px]" />
      <div className="bg-ink absolute top-[21px] left-[29px] h-[3px] w-[3px]" />
      <div className="absolute top-[30px] left-[13px] h-[26px] w-[26px]" style={{ background: outfit }} />
      <div className="bg-ink/25 absolute top-[52px] left-[13px] h-1 w-[26px]" />
      <div className="bg-skin-him absolute top-8 left-[7px] h-4 w-[6px]" />
      <div className="bg-skin-him absolute top-8 left-[39px] h-4 w-[6px]" />
      {pose === "sit" ? (
        <>
          <div className="bg-stone-dark absolute top-14 left-[15px] h-2 w-[9px]" />
          <div className="bg-stone-dark absolute top-14 left-[28px] h-2 w-[9px]" />
        </>
      ) : (
        <>
          <div className="bg-stone-dark absolute top-14 left-[17px] h-3 w-[7px]" />
          <div className="bg-stone-dark absolute top-14 left-7 h-3 w-[7px]" />
          <div className="bg-hair absolute top-[68px] left-[15px] h-[6px] w-[11px]" />
          <div className="bg-hair absolute top-[68px] left-[26px] h-[6px] w-[11px]" />
        </>
      )}
      {basket && <div className="basket absolute top-[36px] -right-2" />}
    </div>
  );
}

export function Her({ className = "", pose = "stand" }: { className?: string; pose?: Pose }) {
  return (
    <div className={`relative h-[76px] w-[52px] ${pose === "walk" ? "walk-bob" : ""} ${className}`} aria-hidden>
      <div className="bg-hair-her absolute top-0 left-[11px] h-3 w-[30px]" />
      <div className="bg-hair-her absolute top-2.5 left-2 h-[22px] w-2.5" />
      <div className="bg-hair-her absolute top-2.5 left-[34px] h-[22px] w-2.5" />
      <div className="bg-skin absolute top-[14px] left-[17px] h-4 w-5" />
      <div className="bg-ink absolute top-[21px] left-[21px] h-[3px] w-[3px]" />
      <div className="bg-ink absolute top-[21px] left-[30px] h-[3px] w-[3px]" />
      <div className="bg-dress absolute top-[30px] left-[13px] h-7 w-[26px]" />
      <div className="bg-dress absolute top-11 left-[11px] h-[14px] w-[30px]" />
      <div className="bg-ink/20 absolute top-[54px] left-[11px] h-1 w-[30px]" />
      <div className="bg-skin absolute top-8 left-[7px] h-4 w-[6px]" />
      <div className="bg-skin absolute top-8 left-[39px] h-4 w-[6px]" />
      {pose === "sit" ? (
        <>
          <div className="bg-skin absolute top-[58px] left-[18px] h-2 w-[6px]" />
          <div className="bg-skin absolute top-[58px] left-7 h-2 w-[6px]" />
        </>
      ) : (
        <>
          <div className="bg-skin absolute top-[58px] left-[18px] h-3 w-[6px]" />
          <div className="bg-skin absolute top-[58px] left-7 h-3 w-[6px]" />
          <div className="bg-terra absolute top-[70px] left-4 h-[6px] w-2.5" />
          <div className="bg-terra absolute top-[70px] left-[26px] h-[6px] w-2.5" />
        </>
      )}
    </div>
  );
}

export function Pigeon({ className = "", flap = true }: { className?: string; flap?: boolean }) {
  return (
    <div className={`relative h-6 w-10 border-2 border-ink bg-stone-dark ${className}`} aria-hidden>
      <div
        className={`border-ink bg-stone absolute top-[-9px] left-2 h-[11px] w-[22px] border-2 ${flap ? "origin-bottom animate-[flap_0.18s_steps(2,end)_infinite_alternate]" : ""}`}
      />
      <div className="border-ink bg-stone-dark absolute top-1 -left-2 h-2 w-2 border-2" />
      <div className="bg-terra absolute top-[7px] -left-[11px] h-[3px] w-[8px]" />
    </div>
  );
}
