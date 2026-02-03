"use client";

import { useEffect } from "react";

const BODY_CLASS = "route-product-fullscreen";

export default function ProductRouteChromeOff() {
  useEffect(() => {
    document.body.classList.add(BODY_CLASS);
    return () => document.body.classList.remove(BODY_CLASS);
  }, []);

  return null;
}
