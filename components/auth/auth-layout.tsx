import Image from "next/image";
import { FadeIn } from "../motion/fade-in";
const AuthLayout: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ children, title, subtitle }) => {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className=" h-full w-[60%] bg-primary hidden lg:grid place-content-center pointer-events-none">
        <Image
          src={"/assets/logos/splash.webp"}
          alt="Splash Image"
          width={100}
          height={100}
          className="h-23 w-70.5"
        />
      </div>
      <FadeIn className=" w-full lg:w-[40%] flex items-center justify-center">
        <div className="w-full grid gap-4 md:gap-6 lg:w-103 p-4 md:p-6">
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
