import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="brand-grid relative grid min-h-screen overflow-hidden bg-[#f7f8f0] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="brand-orbit relative hidden overflow-hidden bg-[linear-gradient(145deg,#064c3b_0%,#078247_55%,#136f83_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute right-[12%] top-[13%] size-3 rounded-full bg-[#dfa72f] shadow-[0_0_0_8px_rgba(223,167,47,0.12)]" />
        <div className="absolute right-[22%] top-[30%] size-5 rounded-full bg-[#75b83c]/80" />
        <div className="absolute bottom-[27%] left-[10%] size-2 rounded-full bg-[#8dc5e2]" />
        <div className="relative flex items-center gap-4">
          <div className="brand-float flex size-[94px] items-center justify-center rounded-full bg-white p-1.5 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.55)] ring-2 ring-[#dfa72f]/75">
            <Image
              src="/ichi-skill-logo.png"
              alt="Logo ICHI SKILL"
              width={86}
              height={86}
              className="size-full rounded-full object-cover"
              priority
            />
          </div>
          <div>
            <p className="font-display text-2xl font-black tracking-[0.05em] text-[#f4c456]">
              ICHI SKILL
            </p>
            <p className="mt-1 text-xs font-bold tracking-[0.22em] text-white/65">
              KNS · CĐS · STEM
            </p>
          </div>
        </div>

        <div className="relative max-w-[650px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide backdrop-blur">
            <span className="size-2 rounded-full bg-[#f4c456]" />
            Nền tảng quản trị tài chính học đường
          </div>
          <h2 className="font-display text-5xl font-black leading-[1.08] tracking-tight xl:text-[58px]">
            Minh bạch từng khoản thu,
            <span className="block text-[#f4c456]">vững bước mỗi kỹ năng.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/68">
            Một không gian điều hành thống nhất cho kế hoạch thu, công nợ, QR
            động, đối soát và báo cáo của ICHI SKILL.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[
            ["KNS", "Kỹ năng sống"],
            ["CĐS", "Công dân số"],
            ["STEM", "Khơi mở sáng tạo"],
          ].map(([code, label], index) => (
            <div
              key={code}
              className="rounded-[18px] border border-white/12 bg-white/8 p-4 backdrop-blur-sm"
            >
              <div
                className={`mb-3 h-1.5 w-9 rounded-full ${index === 0 ? "bg-[#75b83c]" : index === 1 ? "bg-[#dfa72f]" : "bg-[#68acd2]"}`}
              />
              <p className="font-display text-lg font-black">{code}</p>
              <p className="mt-1 text-[11px] text-white/55">{label}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="relative flex items-center justify-center p-5 sm:p-10 xl:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border-[34px] border-[#75b83c]/8" />
        <div className="pointer-events-none absolute bottom-[-130px] left-[-80px] size-80 rounded-full border border-[#237fb5]/12" />
        <LoginForm />
      </div>
    </main>
  );
}
