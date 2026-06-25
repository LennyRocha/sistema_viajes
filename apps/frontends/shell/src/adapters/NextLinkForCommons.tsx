import Link from "next/link";
import { forwardRef } from "react";

const NextLinkForCommons = forwardRef(
  function NextLinkComposed(props: any, ref) {
    const { href, ...other } = props;

    return <Link ref={ref} href={href} {...other} />;
  },
);

export default NextLinkForCommons;