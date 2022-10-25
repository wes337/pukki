import { Fragment } from "react";
import { IconArrowRight } from "@tabler/icons";
import variables from "../../styles/variables.module.scss";
import styles from "./List.module.scss";
import Image from "next/image";

export default function List({ items, withDivider }) {
  return (
    <div className={styles.list}>
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <button onClick={item.onClick}>
            {item.icon && (
              <img
                className={styles.icon}
                src={item.icon}
                height={28}
                width={28}
                alt=""
              />
            )}
            {item.label}
            <div className={styles.open}>
              <IconArrowRight
                size={28}
                stroke={1}
                color={variables.colorGray}
              />
            </div>
          </button>
          {withDivider && index !== items.length - 1 && <hr />}
        </Fragment>
      ))}
    </div>
  );
}
