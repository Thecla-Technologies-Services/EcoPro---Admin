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
        {/* The EcoPro mark is drawn in dark green with a near-black wordmark,
            so it sits on a white disc rather than straight on the panel, where
            it would barely read. Swap the disc for a white wordmark asset if
            one is ever produced.

            A square box centring the mark, since the logo is taller than it is
            wide and padding alone would give an oval. */}
        <div className="flex size-80 items-center justify-center rounded-full bg-white shadow-sm">
          <Image
            src={"/assets/logos/sidebar.webp"}
            alt="EcoPro"
            width={188}
            height={230}
            className="h-45 w-auto"
            priority
          />
        </div>
      </div>
      <FadeIn className=" w-full lg:w-[40%] flex items-center justify-center">
        {/* Capped at every width, not just `lg`: below that breakpoint the
            splash pane is hidden and this column takes the whole screen, so a
            tablet would otherwise stretch the inputs edge to edge. */}
        <div className="grid w-full max-w-103 gap-4 p-4 md:gap-6 md:p-6">
          {/* The splash pane carries the brand at `lg` and up; below that it is
              hidden, so the mark sits at the top of the form instead. The
              sidebar logo rather than the splash one, which is drawn for the
              green panel. */}
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
