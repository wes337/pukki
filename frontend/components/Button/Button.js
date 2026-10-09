import Icon from "../Icon/Icon";
import styles from "./Button.module.scss";

export default function Button({
  children,
  icon,
  iconSize,
  onClick,
  variant = "primary",
  size = "medium",
  block,
  disabled,
  type = "button",
}) {
  const getIconSize = () => {
    switch (size) {
      case "large":
        return 28;
      case "medium":
        return 24;
      case "small":
        return 18;
      default:
        return 24;
    }
  };

  const getClassName = () => {
    let className = `${styles[variant]} ${styles[size]}`;

    if (block) {
      className += ` ${styles.block}`;
    }

    if (disabled) {
      className += ` ${styles.disabled}`;
    }

    return className;
  };

  return (
    <button
      className={getClassName()}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={iconSize ?? getIconSize()} />}
      {children}
    </button>
  );
}
