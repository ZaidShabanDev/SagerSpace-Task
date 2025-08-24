import React from 'react';

export interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavigationData {
  navMain: NavItem[];
}

export type ViewType = 'dashboard' | 'map';
