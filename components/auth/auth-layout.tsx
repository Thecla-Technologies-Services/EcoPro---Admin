import Image from "next/image";
import { FadeIn } from "../motion/fade-in";
const AuthLayout: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ children, title, subtitle }) => {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="pointer-events-none hidden h-full w-[60%] place-content-center bg-primary lg:grid">
        {/* White-ink mark on transparency, so it sits straight on this green
            panel with no plate behind it. The source export was flattened onto
            an opaque `#f7f7f7` square — that square is what the alpha channel
            here replaces, so re-exporting from the designer's file must keep
            the transparency or the box comes back. Not `sidebar.webp`: that
            one is inked in the brand greens — one of them `#3c8b57`, two
            points off this panel's `#3c8b55` — so on green it would read as a
            hole rather than a logo, transparency notwithstanding. */}
        <Image
          src={"/assets/logos/eco-pro.webp"}
          alt="EcoPro"
          width={1254}
          height={1254}
          className="mx-auto h-auto w-3/5"
          priority
        />
      </div>
      <FadeIn className=" w-full lg:w-[40%] flex items-center justify-center">
        {/* Capped at every width, not just `lg`: below that breakpoint the
            splash pane is hidden and this column takes the whole screen, so a
            tablet would otherwise stretch the inputs edge to edge. */}
        <div className="grid w-full max-w-103 gap-4 p-4 md:gap-6 md:p-6">
          {/* The splash pane carries the brand at `lg` and up; below that it is
              hidden, so the mark sits at the top of the form instead. The
              sidebar logo rather than the panel's white-ink mark, which is
              invisible against this pane's light background. */}
          <Image
            src={"/assets/logos/sidebar.webp"}
            alt="EcoPro"
            width={100}
            height={100}
            className="mx-auto h-12.5 w-12.5 lg:hidden"
          />

          <div className="grid gap-2 text-center lg:text-left">
            <h1 className="text-foreground font-semibold text-lg">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          <div className="w-full ">{children}</div>
        </div>
      </FadeIn>
    </div>
  );
};

export default AuthLayout;
