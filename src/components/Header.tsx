/**
 * Brand header: embeds the CFB Manhole logo image, centered, in place of
 * plain "CFB Manhole" text (FR-001). The text only renders as a fallback if
 * the logo image fails to load, so the page never appears unbranded
 * (FR-009); the image's alt text covers the normal/accessible case.
 */
import { useState } from "react";
import logo from "../assets/cfb-manhole-logo.png";
import "./Header.css";

export function Header() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="site-header">
      <img
        className="site-header__logo"
        src={logo}
        alt="CFB Manhole"
        onError={() => setLogoFailed(true)}
      />
      {logoFailed && <h1 className="site-header__title">CFB Manhole</h1>}
    </header>
  );
}
