import { Cinzel } from "next/font/google";

import { GachaPage } from "@/features/gacha";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700", "900"] });

export default function Home() {
  return (
    <div className={cinzel.className}>
      <GachaPage />
    </div>
  );
}
