import React, { useEffect, useState } from 'react';
import { Shield, Lock, Eye, Key, Sun, Moon, LogIn, ChevronUp, BookOpen, Layers, PhoneCall, CheckCircle } from 'lucide-react';

export default function LandingPage({ theme, toggleTheme, onNavigate }) {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const sections = ['home', 'about', 'features', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Opacity Background and Shader */}
      <div className="landing-bg"></div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-k">KCE</span>
          <span className="logo-text">Karpagam College of Engineering</span>
        </div>

        <ul className="nav-links">
          <li>
            <span 
              onClick={() => scrollTo('home')} 
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            >
              Home
            </span>
          </li>
          <li>
            <span 
              onClick={() => scrollTo('about')} 
              className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
            >
              About
            </span>
          </li>
          <li>
            <span 
              onClick={() => scrollTo('features')} 
              className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
            >
              Features
            </span>
          </li>
          <li>
            <span 
              onClick={() => scrollTo('contact')} 
              className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
            >
              Contact
            </span>
          </li>
        </ul>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => onNavigate('login')} className="btn btn-primary">
            <LogIn size={18} />
            <span>Login</span>
          </button>
        </div>
      </nav>

      {/* Main Home / Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-left">
          <div className="hero-tagline">
            <Shield size={16} />
            <span>AI-Powered Safety & Cyber Security</span>
          </div>
          <h1 className="hero-title">KCE - College of Engineering</h1>
          <div className="hero-desc">
            <p>Is accredited by NAAC with an A+ grade, reflecting its strong academic quality and institutional standards with the excellence.</p>
            <p>Our institution is dedicated to nurturing technical talent and preparing student leaders for future challenges.</p>
            <p>We assure each and every student and faculty member to protect from Harmful Content and Cyber-bullyuing.</p>
            
          </div>
          <button onClick={() => scrollTo('about')} className="btn btn-primary">
            Learn More
          </button>
        </div>

        <div className="hero-right">
          {/* Rotating orbit ring */}
          <div className="security-orbit-ring animate-spin-slow">
            <div className="security-symbol symbol-1">
              <Shield size={20} />
            </div>
            <div className="security-symbol symbol-2">
              <Lock size={20} />
            </div>
            <div className="security-symbol symbol-3">
              <Eye size={20} />
            </div>
            <div className="security-symbol symbol-4">
              <Key size={20} />
            </div>
          </div>
          
          <div className="college-img-container animate-float">
            <img src="/round1.jpg" alt="KCE Campus & Safety" className="college-img" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-section">
        <div className="section-header">
          <h2 className="section-title">About the SafeGuard AI Platform</h2>
          <p className="section-subtitle">AI based Cyberbullying and harmful Content detection Platform.</p>
        </div>
        <div className="about-text">
          <p>Our AI-Based Cyberbullying and Harmful Content Detection Platform is designed to create a safer and more responsible digital environment for students and educational institutions. In today’s digital world, online communication has become an essential part of learning, but it also brings challenges such as cyberbullying, abusive language, and harmful content.Designed specifically for college, the platform provides dedicated dashboards for students, teachers, and administrators. It offers real-time alerts, detailed analytics, and content moderation tools that help institutions maintain discipline and safety in their digital ecosystems. With its user-friendly interface and intelligent monitoring system, it simplifies the process of managing online safety.Our mission is to promote a healthy and secure online environment where students can express themselves freely without fear of harassment or abuse. By combining technology with responsibility, this platform aims to build a stronger, safer, and more supportive digital community for the future.</p>
          
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <h2 className="section-title">Platform Features</h2>
          <p className="section-subtitle">Intelligent tools designed for campus protection and collaborative incident management.</p>
        </div>
        <div className="features-grid">
          <div className="glass-panel feature-card glass-panel-hover">
            <div className="feature-icon">
              <Shield size={28} />
            </div>
            <h3 className="feature-title">AI Content Scanning</h3>
            <p className="feature-desc">Real-time deep parsing of textual submissions and chats to identify cyberbullying, threats, harassment, and toxic behaviour instantly.</p>
          </div>

          <div className="glass-panel feature-card glass-panel-hover">
            <div className="feature-icon">
              <Layers size={28} />
            </div>
            <h3 className="feature-title">Role-Based Dashboards</h3>
            <p className="feature-desc">Custom tailored workspaces for Students, Teachers, Counselors, Administrators, and Principals with individual workflows.</p>
          </div>

          <div className="glass-panel feature-card glass-panel-hover">
            <div className="feature-icon">
              <BookOpen size={28} />
            </div>
            <h3 className="feature-title">Academic & Safety Integration</h3>
            <p className="feature-desc">Connects assignments and academic tasks directly with safety scores, helping detect stress patterns or target indicators.</p>
          </div>

          <div className="glass-panel feature-card glass-panel-hover">
            <div className="feature-icon">
              <CheckCircle size={28} />
            </div>
            <h3 className="feature-title">Incident Life Cycle</h3>
            <p className="feature-desc">From initial AI flag detection, to review by teacher, forwarding to counselor, resolution logging, and final principal severity analysis reports.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-section">
        <div className="section-header">
          <h2 className="section-title">Contact</h2>
          <p className="section-subtitle">Reach administrative support.</p>
        </div>
        <div className="glass-panel contact-box">
          <PhoneCall size={32} className="animate-pulse-glow" style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <p style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '8px' }}>Have any questions?</p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Contact admin of Karpagam College of Engineering for any queries.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KCE Administrative Block • info@kce.ac.in</p>
        </div>
        
        <button onClick={() => scrollTo('home')} className="btn btn-secondary back-to-top-btn">
          <ChevronUp size={16} />
          <span> Back to Top</span>
        </button>
      </section>
    </div>
  );
}
