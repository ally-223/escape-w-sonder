"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const startPolaroids = [
  {
    id: "01",
    src: "/startpolaroid1.png",
    positionClass:
      "left-[3%] top-[9%] w-[22vw] min-w-[76px] max-w-[94px] min-[390px]:left-[5%] min-[390px]:top-[12%] sm:left-[18%] sm:top-[6%] sm:w-[10vw] sm:min-w-[110px] sm:max-w-[150px]",
    rotate: -2,
    hoverRotate: 3,
    caption: "mmm fritters",
  },
  {
    id: "02",
    src: "/startpolaroid2.png",
    positionClass:
      "left-[2%] bottom-[4%] w-[21vw] min-w-[76px] max-w-[88px] min-[390px]:left-[6%] min-[390px]:bottom-[9%] sm:left-[5%] sm:bottom-[16%] sm:w-[13vw] sm:min-w-[110px] sm:max-w-[210px]",
    rotate: 2,
    hoverRotate: -2,
    caption: "creamyy alfredo",
  },
  {
    id: "03",
    src: "/startpolaroid3.png",
    positionClass:
      "right-[2%] top-[9%] w-[20vw] min-w-[72px] max-w-[88px] min-[390px]:right-[5%] min-[390px]:top-[12%] sm:right-[10%] sm:top-[14%] sm:w-[10vw] sm:min-w-[110px] sm:max-w-[170px]",
    rotate: 3,
    hoverRotate: -2,
    caption: "cool antiques",
  },
  {
    id: "04",
    src: "/startpolaroid4.png",
    positionClass:
      "right-[2%] bottom-[2%] w-[22vw] min-w-[76px] max-w-[92px] min-[390px]:right-[5%] min-[390px]:bottom-[8%] sm:bottom-auto sm:right-[6%] sm:top-[49%] sm:w-[11vw] sm:min-w-[110px] sm:max-w-[165px]",
    rotate: -3,
    hoverRotate: 2,
    caption: "aww fluff balls",
  },
];

export default function EscapeLandingPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#b7a58c] text-[#fff9ed]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url(/start_bg.png)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative mx-auto min-h-screen w-full max-w-[1120px]"
      >
        <div className="absolute inset-x-0 bottom-0 top-16 md:top-[4.75rem]">
          <div className="absolute inset-0">
            {startPolaroids.map((photo) => (
              <motion.div
                key={photo.id}
                className={`absolute cursor-default group ${photo.positionClass}`}
                animate={{ rotate: photo.rotate }}
                whileHover={{ rotate: photo.hoverRotate, scale: 1.06, y: -5 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
              >
                <span className="absolute -top-4 right-0 font-mono text-[10px] tracking-[0.16em] text-white/80">
                  [ {photo.id} ]
                </span>
                <img
                  src={photo.src}
                  alt=""
                  className="aspect-[0.78] w-full border border-white/70 object-cover shadow-[0_8px_18px_rgba(52,37,24,0.18)]"
                  aria-hidden="true"
                />
                <p className="mt-1.5 text-center font-mono text-[10px] tracking-[0.16em] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {photo.caption}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="absolute left-1/2 top-[48%] w-[min(620px,86vw)] -translate-x-1/2 -translate-y-1/2 text-center sm:top-[52%]">
            <h1 className="font-serif text-[clamp(3.55rem,16vw,4.7rem)] font-light leading-[0.78] tracking-[-0.055em] text-white drop-shadow-[0_2px_18px_rgba(71,47,25,0.14)] sm:text-[clamp(4rem,10vw,7.5rem)]">
              Say yes to
              <br />
              a <span className="italic" style={{ color: "#dcff73" }}>mystery</span>
              <br />
              weekend?
            </h1>

            <Link
              href="/escape/start"
              className="mt-8 inline-flex rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white/20 sm:mt-10"
            >
              count me in :D
            </Link>
          </div>

          <span className="absolute left-[73%] top-[47%] hidden text-3xl font-thin text-white/60 sm:block">
            +
          </span>
        </div>
      </motion.div>
    </section>
  );
}
