'use client';

import { useState, useEffect, useRef } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Database, MessageSquare, Smartphone, Zap, ArrowRight, Star, Shield, Target, BarChart3, Building2, Lock, LogOut, ChevronDown, TrendingUp, Eye, Clock, Award, Mail, FileText } from "lucide-react";
import Link from "next/link";
import { Logo, LogoWithIcon } from "@/components/brand/Logo";
import { Tagline, TaglineHero, RotatingTagline } from "@/components/brand/Tagline";
import { brandConfig } from "@/lib/brand-config";
import AuthHeader from "@/components/navigation/AuthHeader";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AnimatedText } from "@/components/ui/animated-text";
import { EnhancedFeatures, HighlightedFeatures } from "@/components/ui/enhanced-features";

export default function Home() {
  // Safe authentication state - handles missing Firebase provider
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const signOut = () => {
    localStorage.removeItem('linkedin-session');
    localStorage.removeItem('auth-token');
    window.location.reload();
  };

  // Check for LinkedIn session on load
  useEffect(() => {
    try {
      const linkedinSession = localStorage.getItem('linkedin-session');
      if (linkedinSession) {
        const sessionData = JSON.parse(linkedinSession);
        if (sessionData.exp && Date.now() < sessionData.exp) {
          setUser({ email: sessionData.email || 'user@linkedin.com' });
        }
      }
    } catch (error) {
      console.log('No valid LinkedIn session found');
    }
    setLoading(false);
  }, []);

  // Safe role state - simplified for LinkedIn-only authentication
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegularUser, setIsRegularUser] = useState(true);
  const roleLoading = false;
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const forumRef = useRef<HTMLElement>(null);
  const orgChartsRef = useRef<HTMLElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine redirect URL based on user role
  const getRedirectUrl = () => {
    if (isAdmin) {
      return '/admin';
    }
    return '/forum';
  };

  // Determine button text based on user role
  const getButtonText = () => {
    if (isAdmin) {
      return 'Go to Admin';
    }
    return 'Go to Forum';
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Smooth scroll to sections
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 transition-colors duration-300">
        <div className="container-premium">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <LogoWithIcon 
                size="md" 
                className="cursor-pointer"
              />
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              {user ? (
                <>
                  <Link href="/forum" className="nav-link flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>Forum</span>
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">Active</span>
                  </Link>
                  <Link href="/organizations" className="nav-link flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>Org Charts</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">New</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => scrollToSection(forumRef)}
                    className="nav-link flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Forum</span>
                  </button>
                  <button
                    onClick={() => scrollToSection(orgChartsRef)}
                    className="nav-link flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Org Charts</span>
                  </button>
                </>
              )}
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome back!
                  </span>
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="bg-foreground hover:bg-foreground/90 text-background font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                      disabled={roleLoading}
                    >
                      <span>{roleLoading ? 'Loading...' : getButtonText()}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
                        <Link href={getRedirectUrl()}>
                          <button
                            className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-muted rounded-t-lg transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            {roleLoading ? 'Loading...' : getButtonText()}
                          </button>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-muted rounded-b-lg transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-foreground hover:bg-foreground/90 text-background font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Remaining content omitted here - archived version */}
      <main className="p-8 text-sm text-muted-foreground">
        Archived previous landing page source. It was moved here to keep the new Flokana landing page clean.
      </main>
    </div>
  );
}
