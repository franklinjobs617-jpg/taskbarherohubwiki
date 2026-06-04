"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { MobileNav } from "./mobile-nav";

type NavContextType = {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const NavContext = createContext<NavContextType>({
  menuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
  toggleMenu: () => {},
});

export function useNav() {
  return useContext(NavContext);
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  return (
    <NavContext.Provider value={{ menuOpen, openMenu, closeMenu, toggleMenu }}>
      <SiteHeader />
      <main className="flex-1 pb-14 md:pb-0">{children}</main>
      <MobileNav />
    </NavContext.Provider>
  );
}
