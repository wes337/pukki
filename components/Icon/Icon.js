import Image from "next/image";

export default function Icon({ name = "bauble", size = 18 }) {
  return (
    <Image
      src={`/images/icons/${name}.png`}
      height={size}
      width={size}
      alt=""
    />
  );
}
