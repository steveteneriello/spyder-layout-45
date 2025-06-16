import React from 'react';
import { DynamicSideCategory } from './DynamicSideCategory';

interface SideCategoryProps {
  section: string;
  items: any[];
}

export function SideCategory({ section, items }: SideCategoryProps) {
  // This component now uses DynamicSideCategory for better menu management
  return <DynamicSideCategory />;
}

export default SideCategory;
