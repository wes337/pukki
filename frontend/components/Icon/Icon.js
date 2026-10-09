export default function Icon({ name = "bauble", size = 18 }) {
  return (
    <img
      src={`/images/icons/${name}.png`}
      height={size}
      width={size}
      alt=""
    />
  );
}
