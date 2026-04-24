/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sun, Moon, Monitor, User, Palette, Bell, Shield, Info,
  ChevronRight, LogOut, ArrowLeft, BellOff, BellRing
} from 'lucide-react';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { useNotifications } from '@/hooks/useNotifications';

// ─── Theme Option ─────────────────────────────────────────────────────────────

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Clean & bright' },
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS' },
];

// ─── Section Wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-teal px-1">{title}</h2>
    <div className="bg-white dark:bg-[#161B2E] rounded-[1.5rem] border border-primary-teal/5 dark:border-white/[0.06] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {children}
    </div>
  </div>
);

// ─── Row Item ─────────────────────────────────────────────────────────────────

const SettingsRow: React.FC<{
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  children?: React.ReactNode;
}> = ({ icon: Icon, label, subtitle, href, onClick, danger, children }) => {
  const inner = (
    <div className={`flex items-center gap-4 px-5 py-4 transition-colors group
      ${danger
        ? 'hover:bg-secondary-coral/5 active:bg-secondary-coral/10'
        : 'hover:bg-primary-teal/5 active:bg-primary-teal/10'
      }
      border-b border-primary-teal/5 dark:border-white/[0.04] last:border-b-0`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        danger ? 'bg-secondary-coral/10 text-secondary-coral' : 'bg-primary-teal/10 text-primary-teal'
      }`}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-black ${danger ? 'text-secondary-coral' : 'text-text-charcoal dark:text-[#E2E8F0]'}`}>
          {label}
        </p>
        {subtitle && <p className="text-[10px] text-text-gray font-medium mt-0.5">{subtitle}</p>}
      </div>
      {children ? (
        <div>{children}</div>
      ) : (href || onClick) ? (
        <ChevronRight size={16} className="text-text-gray group-hover:text-primary-teal transition-colors shrink-0" />
      ) : null}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  return inner;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const { permission, enabled, requestPermission, disableNotifications } = useNotifications();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-2 space-y-8">

      {/* Header */}
      <div className="space-y-1 pt-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black text-text-gray uppercase tracking-widest hover:text-primary-teal transition-colors group mb-6"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <h1 className="text-5xl font-black text-text-charcoal dark:text-[#E2E8F0] tracking-tighter font-heading italic">
          Settings
        </h1>
        <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest">
          Customize your CampusOS experience
        </p>
      </div>

      {/* Profile Preview */}
      {user && (
        <Link href="/profile" className="flex items-center gap-4 p-5 bg-gradient-to-r from-primary-teal/10 to-secondary-coral/10 dark:from-primary-teal/20 dark:to-secondary-coral/20 rounded-[1.5rem] border border-primary-teal/10 group hover:border-primary-teal/30 transition-all">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-white/10 shadow-lg shrink-0">
            <AvatarDisplay avatar={userData?.avatar || user.photoURL} fallbackSeed={user.uid} className="w-full h-full !rounded-none !border-none" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-text-charcoal dark:text-[#E2E8F0] group-hover:text-primary-teal transition-colors">
              {userData?.name || user.displayName || 'RIT Student'}
            </p>
            <p className="text-[10px] text-text-gray font-bold uppercase tracking-wider mt-0.5">
              {userData?.role || 'Student'} · View profile →
            </p>
          </div>
          <ChevronRight size={18} className="text-text-gray group-hover:text-primary-teal transition-colors shrink-0" />
        </Link>
      )}

      {/* ── Appearance ─────────────────────────────────────────────────────── */}
      <Section title="Appearance">
        <div className="p-5 space-y-4 border-b border-primary-teal/5 dark:border-white/[0.04]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary-teal/10 flex items-center justify-center shrink-0">
              <Palette size={16} className="text-primary-teal" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-black text-text-charcoal dark:text-[#E2E8F0]">Theme</p>
              <p className="text-[10px] text-text-gray font-medium">Choose how CampusOS looks to you</p>
            </div>
          </div>

          {/* 3-way segmented control */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-background-neutral dark:bg-[#0B0F1A] rounded-2xl">
            {THEME_OPTIONS.map(({ value, label, icon: Icon, desc }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-white dark:bg-[#1E2540] shadow-[0_4px_16px_rgba(0,194,203,0.15)] border border-primary-teal/20 scale-[1.02]'
                      : 'hover:bg-white/60 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    active ? 'bg-primary-teal text-white shadow-[0_4px_12px_rgba(0,194,203,0.4)]' : 'bg-primary-teal/10 text-primary-teal'
                  }`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-center">
                    <p className={`text-[11px] font-black uppercase tracking-wider ${active ? 'text-primary-teal' : 'text-text-charcoal dark:text-[#E2E8F0]'}`}>
                      {label}
                    </p>
                    <p className="text-[9px] text-text-gray font-medium mt-0.5">{desc}</p>
                  </div>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-teal" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current resolved theme indicator */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className={`w-2 h-2 rounded-full ${resolvedTheme === 'dark' ? 'bg-primary-teal' : 'bg-warning'}`} />
            <span className="text-[10px] text-text-gray font-bold uppercase tracking-widest">
              Currently showing: {resolvedTheme} mode
            </span>
          </div>
        </div>
      </Section>

      {/* ── Account ────────────────────────────────────────────────────────── */}
      <Section title="Account">
        <SettingsRow icon={User} label="Edit Profile" subtitle="Update name, bio & role" href="/profile" />
        <SettingsRow icon={Palette} label="Customize Avatar" subtitle="Build your unique look" href="/profile" />
      </Section>

      {/* ── Notifications ──────────────────────────────────────────────────── */}
      <Section title="Notifications">
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            enabled ? 'bg-primary-teal/10 text-primary-teal' : 'bg-background-neutral dark:bg-[#1E2540] text-text-gray'
          }`}>
            {enabled ? <BellRing size={16} strokeWidth={2.5} /> : <BellOff size={16} strokeWidth={2.5} />}
          </div>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-text-charcoal dark:text-[#E2E8F0]">Push Notifications</p>
            <p className="text-[10px] text-text-gray font-medium mt-0.5">
              {permission === 'denied'
                ? '⚠️ Blocked in browser — enable in site settings'
                : permission === 'unsupported'
                ? 'Not supported in this browser'
                : enabled
                ? 'You\'ll get notified for requests & updates'
                : 'Get real-time alerts for team requests & events'}
            </p>
          </div>

          {/* Toggle or blocked badge */}
          {permission === 'denied' ? (
            <span className="text-[9px] font-black uppercase tracking-widest text-secondary-coral bg-secondary-coral/10 px-3 py-1.5 rounded-full shrink-0">
              Blocked
            </span>
          ) : permission === 'unsupported' ? (
            <span className="text-[9px] font-black uppercase tracking-widest text-text-gray bg-background-neutral dark:bg-[#1E2540] px-3 py-1.5 rounded-full shrink-0">
              N/A
            </span>
          ) : (
            <button
              onClick={enabled ? disableNotifications : requestPermission}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
                enabled ? 'bg-primary-teal shadow-[0_4px_12px_rgba(0,194,203,0.4)]' : 'bg-gray-200 dark:bg-[#1E2540]'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                enabled ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
              }`} />
            </button>
          )}
        </div>
      </Section>

      {/* ── Privacy ────────────────────────────────────────────────────────── */}
      <Section title="Privacy">
        <SettingsRow icon={Shield} label="Privacy Controls" subtitle="Coming soon" />
      </Section>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <Section title="About">
        <SettingsRow icon={Info} label="CampusOS" subtitle="Version 1.0.0 · Built for RIT students" />
      </Section>

      {/* ── Danger Zone ────────────────────────────────────────────────────── */}
      <Section title="Account Actions">
        <SettingsRow
          icon={LogOut}
          label="Logout"
          subtitle="Sign out of your account"
          onClick={handleLogout}
          danger
        />
      </Section>

    </div>
  );
}
