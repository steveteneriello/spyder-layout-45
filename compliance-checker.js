#!/usr/bin/env node
/**
 * Page Compliance Checker for Spyder Layout Design System
 * Validates new pages against architectural standards
 */

import { readFileSync } from 'fs';
import { dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PageComplianceChecker {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = '';
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.isAdminPage = filePath.includes('/admin/') || filePath.includes('Admin');
  }

  async checkFile() {
    try {
      this.content = readFileSync(this.filePath, 'utf8');
      this.runAllChecks();
      return this.generateReport();
    } catch (error) {
      this.errors.push(`Failed to read file: ${error.message}`);
      return this.generateReport();
    }
  }

  runAllChecks() {
    this.checkRequiredImports();
    this.checkThemeIntegration();
    this.checkMenuIntegration();
    this.checkLayoutStructure();
    this.checkForbiddenPatterns();
    this.checkNavigationColors();
    this.checkLoadingStates();
    this.checkErrorHandling();
    this.checkDebugIntegration();
    this.checkDeadFeatures();
    this.checkAccessibility();
    this.checkResponsiveDesign();
  }

  checkRequiredImports() {
    const required = [
      { import: "import React.*from ['\"]react['\"]", name: "React", isRegex: true },
      { import: "import.*SidebarLayout.*from.*@/components/layout/SidebarLayout", name: "SidebarLayout", isRegex: true },
      { import: "import.*useGlobalTheme.*from.*@/contexts/GlobalThemeContext", name: "useGlobalTheme", isRegex: true },
      { import: "import.*useMenuConfig.*from.*@/hooks/useMenuConfig", name: "useMenuConfig", isRegex: true }
    ];

    required.forEach(req => {
      const found = req.isRegex 
        ? new RegExp(req.import).test(this.content)
        : this.content.includes(req.import);
      
      if (found) {
        this.passed.push(`✅ Required import: ${req.name}`);
      } else {
        this.errors.push(`❌ Missing required import: ${req.name}`);
      }
    });
  }

  checkThemeIntegration() {
    // Check for theme hook usage
    if (this.content.includes('useGlobalTheme()')) {
      this.passed.push('✅ Theme hook properly used');
    } else {
      this.errors.push('❌ Missing useGlobalTheme() hook usage');
    }

    // Check for theme-aware classes
    const themeClasses = ['bg-background', 'text-foreground', 'text-muted-foreground', 'bg-card'];
    const foundClasses = themeClasses.filter(cls => this.content.includes(cls));
    
    if (foundClasses.length > 0) {
      this.passed.push(`✅ Using theme-aware classes: ${foundClasses.join(', ')}`);
    } else {
      this.warnings.push('⚠️ No theme-aware CSS classes found');
    }

    // Check for forbidden hardcoded colors
    const forbiddenPatterns = [
      /bg-white\b/, /bg-black\b/, /text-white\b/, /text-black\b/,
      /bg-gray-\d+/, /text-gray-\d+/, /#[0-9a-fA-F]{3,6}/, /rgb\(/
    ];

    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(this.content)) {
        this.errors.push('❌ Found hardcoded colors - use theme-aware classes instead');
      }
    });
  }

  checkMenuIntegration() {
    if (this.isAdminPage) {
      // Admin pages don't require menu integration
      this.passed.push('✅ Admin page - menu integration optional');
      return;
    }

    // Check for menu hook usage
    if (this.content.includes('useMenuConfig()')) {
      this.passed.push('✅ Menu hook properly used');
    } else {
      this.errors.push('❌ Missing useMenuConfig() hook usage');
    }

    // Check for proper menu section mapping
    if (this.content.includes('getSections()') && this.content.includes('section.name') && this.content.includes('section.items')) {
      this.passed.push('✅ Proper menu section integration');
    } else {
      this.errors.push('❌ Incorrect menu section integration - use getSections() with section.name and section.items');
    }

    // Check for SideCategory usage
    if (this.content.includes('<SideCategory')) {
      this.passed.push('✅ SideCategory component used');
    } else {
      this.errors.push('❌ Missing SideCategory component');
    }
  }

  checkLayoutStructure() {
    if (this.isAdminPage) {
      // Admin pages can use simplified layout pattern
      if (this.content.includes('min-h-screen') && this.content.includes('bg-background')) {
        this.passed.push('✅ Proper admin page layout');
      } else {
        this.warnings.push('⚠️ Admin page should include min-h-screen and bg-background');
      }
      
      // Admin pages should still use theme hook
      if (this.content.includes('useGlobalTheme')) {
        this.passed.push('✅ Admin page uses theme system');
      } else {
        this.errors.push('❌ Admin page missing theme integration');
      }
    } else {
      // Regular pages must use SidebarLayout
      if (this.content.includes('<SidebarLayout')) {
        this.passed.push('✅ SidebarLayout component used');
      } else {
        this.errors.push('❌ Missing SidebarLayout component');
      }

      // Check for required props
      const requiredProps = ['nav=', 'category=', 'menuItems='];
      requiredProps.forEach(prop => {
        if (this.content.includes(prop)) {
          this.passed.push(`✅ SidebarLayout prop: ${prop.replace('=', '')}`);
        } else {
          this.errors.push(`❌ Missing SidebarLayout prop: ${prop.replace('=', '')}`);
        }
      });

      // Check for main content wrapper
      if (this.content.includes('min-h-screen') && this.content.includes('bg-background')) {
        this.passed.push('✅ Proper main content wrapper');
      } else {
        this.warnings.push('⚠️ Main content wrapper should include min-h-screen and bg-background');
      }
    }
  }

  checkForbiddenPatterns() {
    // Check for hardcoded menu arrays
    if (this.content.includes('const allMenuItems = [')) {
      this.errors.push('❌ Found hardcoded menu array - use useMenuConfig() instead');
    }

    // Check for anchor tags instead of React Router
    if (this.content.includes('<a href=') && !this.content.includes('isExternal')) {
      this.warnings.push('⚠️ Consider using React Router <Link> instead of <a> tags for internal navigation');
    }

    // Check for console.log statements
    if (this.content.includes('console.log')) {
      this.warnings.push('⚠️ Remove console.log statements before production');
    }
  }

  checkNavigationColors() {
    // Check for proper navigation color usage
    const navColorClasses = [
      'text-header-foreground', 'bg-header-background',
      'text-sidebar-foreground', 'bg-sidebar-background'
    ];
    
    const foundNavColors = navColorClasses.filter(cls => this.content.includes(cls));
    if (foundNavColors.length > 0) {
      this.passed.push(`✅ Using navigation color classes: ${foundNavColors.join(', ')}`);
    }

    // Check for BrandLogo proper usage
    if (this.content.includes('<BrandLogo')) {
      if (this.content.includes('textColor=')) {
        this.warnings.push('⚠️ BrandLogo: use className instead of textColor prop for better theme integration');
      } else {
        this.passed.push('✅ BrandLogo component used correctly');
      }
    }
  }

  checkLoadingStates() {
    // Check for loading state patterns
    if (this.content.includes('Skeleton') || this.content.includes('isLoading')) {
      this.passed.push('✅ Loading state patterns implemented');
    }

    // Check for proper loading UI
    if (this.content.includes('<Skeleton') && this.content.includes('className=')) {
      this.passed.push('✅ Skeleton components properly styled');
    }
  }

  checkErrorHandling() {
    // Check for error handling patterns
    if (this.content.includes('try {') || this.content.includes('catch (')) {
      this.passed.push('✅ Error handling implemented');
    }

    // Check for error UI patterns
    if (this.content.includes('error') && this.content.includes('text-destructive')) {
      this.passed.push('✅ Error UI uses proper theme classes');
    }
  }

  checkDebugIntegration() {
    // Check for debug panel integration
    if (this.content.includes('DebugPanel') || this.content.includes('useDebugLogger')) {
      this.passed.push('✅ Debug panel integration found');
    } else {
      this.warnings.push('⚠️ Consider adding DebugPanel for better debugging support');
    }

    // Check for error boundary usage
    if (this.content.includes('DebugErrorBoundary') || this.content.includes('ErrorBoundary')) {
      this.passed.push('✅ Error boundary implemented');
    } else {
      this.warnings.push('⚠️ Consider wrapping component in DebugErrorBoundary');
    }

    // Check for debug logging
    if (this.content.includes('useDebugLogger') || this.content.includes('debug.info')) {
      this.passed.push('✅ Debug logging implemented');
    } else {
      this.warnings.push('⚠️ Consider adding debug logging for better monitoring');
    }
  }

  checkDeadFeatures() {
    // Check for buttons without handlers (moved from other methods)
    const buttonMatches = this.content.matchAll(/<Button[^>]*>/g);
    let deadButtons = 0;
    
    for (const match of buttonMatches) {
      const buttonTag = match[0];
      if (!buttonTag.includes('onClick') && 
          !buttonTag.includes('asChild') && 
          !buttonTag.includes('type="submit"') && 
          !buttonTag.includes('form=')) {
        deadButtons++;
      }
    }

    if (deadButtons > 0) {
      this.warnings.push(`⚠️ Found ${deadButtons} potentially non-functional buttons`);
    } else if (buttonMatches.length > 0) {
      this.passed.push('✅ All buttons have proper handlers');
    }

    // Check for uncontrolled inputs
    const inputMatches = this.content.matchAll(/<Input[^>]*>/g);
    let uncontrolledInputs = 0;
    
    for (const match of inputMatches) {
      const inputTag = match[0];
      if (!inputTag.includes('onChange') && 
          !inputTag.includes('value') && 
          !inputTag.includes('defaultValue')) {
        uncontrolledInputs++;
      }
    }

    if (uncontrolledInputs > 0) {
      this.warnings.push(`⚠️ Found ${uncontrolledInputs} potentially uncontrolled inputs`);
    } else if (inputMatches.length > 0) {
      this.passed.push('✅ All inputs are properly controlled');
    }
  }

  checkAccessibility() {
    // Check for alt text on images
    if (this.content.includes('<img') && !this.content.includes('alt=')) {
      this.warnings.push('⚠️ Images should have alt text for accessibility');
    }

    // Check for proper heading hierarchy
    const headings = this.content.match(/<h[1-6]/g);
    if (headings && headings.length > 0) {
      this.passed.push('✅ Page includes heading elements');
    }
  }

  checkResponsiveDesign() {
    // Check for responsive classes
    const responsivePatterns = [/md:/, /lg:/, /sm:/, /xl:/];
    const hasResponsive = responsivePatterns.some(pattern => pattern.test(this.content));
    
    if (hasResponsive) {
      this.passed.push('✅ Responsive design classes found');
    } else {
      this.warnings.push('⚠️ Consider adding responsive design classes (sm:, md:, lg:, xl:)');
    }

    // Check for grid/flex layouts
    if (this.content.includes('grid') || this.content.includes('flex')) {
      this.passed.push('✅ Modern layout patterns used');
    }
  }

  generateReport() {
    const total = this.errors.length + this.warnings.length + this.passed.length;
    const score = Math.round((this.passed.length / total) * 100) || 0;
    
    return {
      file: this.filePath,
      score,
      errors: this.errors,
      warnings: this.warnings,
      passed: this.passed,
      summary: {
        total,
        errors: this.errors.length,
        warnings: this.warnings.length,
        passed: this.passed.length
      }
    };
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('Usage: node compliance-checker.js <file-path>');
    process.exit(1);
  }

  const checker = new PageComplianceChecker(filePath);
  checker.checkFile().then(report => {
    console.log('\n🔍 PAGE COMPLIANCE REPORT');
    console.log('========================');
    console.log(`File: ${report.file}`);
    if (report.file.includes('/admin/') || report.file.includes('Admin')) {
      console.log('Type: Admin Page (simplified requirements)');
    } else {
      console.log('Type: Standard Page');
    }
    console.log(`Score: ${report.score}%\n`);
    
    if (report.errors.length > 0) {
      console.log('🚨 ERRORS:');
      report.errors.forEach(error => console.log(`  ${error}`));
      console.log('');
    }
    
    if (report.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      report.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }
    
    if (report.passed.length > 0) {
      console.log('✅ PASSED:');
      report.passed.forEach(pass => console.log(`  ${pass}`));
      console.log('');
    }
    
    console.log(`Summary: ${report.summary.passed} passed, ${report.summary.warnings} warnings, ${report.summary.errors} errors`);
    
    if (report.errors.length > 0) {
      process.exit(1);
    }
  });
}

export default PageComplianceChecker;
