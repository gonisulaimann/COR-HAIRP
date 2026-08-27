import logo from "../../assets/HAIRP.png";
export default function Logo({ className }: { className: string }) {
  return (
    <img
      src={logo}
      className={"animate__animated animate__fadeInLeft " + className}
    />
  );
}
