//Part of Admin Interface
import React from 'react';
import { ReactNode } from 'react';
import { Sidebar } from './SideBar';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        {children}
      </main>
    </div>
  );
}