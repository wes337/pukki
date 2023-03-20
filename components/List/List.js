import { Fragment } from "react";
import Image from "next/image";
import styles from "./List.module.scss";

export default function List({ items, withDivider }) {
  return (
    <div className={styles.list}>
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <button onClick={item.onClick}>
            {item.icon && (
              <div className={styles.icon}>
                {typeof item.icon === "string" ? (
                  <Image src={item.icon} height={28} width={28} alt="" />
                ) : (
                  item.icon
                )}
              </div>
            )}
            <div className={styles.label}>{item.label}</div>
            {item.rightIcon && (
              <div className={styles.right}>{item.rightIcon}</div>
            )}
          </button>
          {(withDivider && index !== items.length - 1) ||
            (item.divider && <hr />)}
        </Fragment>
      ))}
    </div>
  );
}
