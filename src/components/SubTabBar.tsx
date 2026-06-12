import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SubTabBarProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export function SubTabBar({ tabs, active, onChange }: SubTabBarProps) {
  return (
    <div 
      className="sub-tab-bar-container"
      style={{
        display: 'flex',
        gap: 4,
        background: 'var(--color-bg-elevated)',
        padding: 4,
        borderRadius: 'var(--radius-sm)',
        marginBottom: 16,
        overflowX: 'auto',
        scrollbarWidth: 'none', // Firefox
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .sub-tab-bar-container::-webkit-scrollbar {
          display: none;
        }
      `}} />
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '6px 10px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--color-surface-glass)' : 'transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.7rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? 'inset 0 -2px 0 var(--color-accent)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && React.cloneElement(tab.icon as React.ReactElement<any>, { size: 12 })}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
