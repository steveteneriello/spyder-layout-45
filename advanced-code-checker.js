#!/usr/bin/env node
/**
 * Advanced Code Quality Checker for Spyder Layout
 * Detects duplications, dead code, non-functional features, and debugging issues
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AdvancedCodeChecker {
  constructor(targetPath) {
    this.targetPath = targetPath;
    this.isDirectory = statSync(targetPath).isDirectory();
    this.files = this.isDirectory ? this.getAllFiles(targetPath) : [targetPath];
    this.results = {
      duplications: [],
      deadFeatures: [],
      missingDebug: [],
      codeSmells: [],
      performance: [],
      accessibility: []
    };
    this.codeBlocks = new Map(); // For duplication detection
  }

  getAllFiles(dir) {
    let files = [];
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(this.getAllFiles(fullPath));
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async checkAll() {
    console.log('🔍 Advanced Code Quality Analysis Starting...\n');
    
    for (const file of this.files) {
      await this.analyzeFile(file);
    }
    
    this.detectDuplications();
    this.generateReport();
    this.generateDebugDashboard();
    
    return this.results;
  }

  async analyzeFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const fileName = basename(filePath);
      
      console.log(`📄 Analyzing: ${fileName}`);
      
      this.checkDeadFeatures(filePath, content);
      this.checkMissingDebugSupport(filePath, content);
      this.checkCodeSmells(filePath, content);
      this.checkPerformanceIssues(filePath, content);
      this.checkAccessibilityIssues(filePath, content);
      this.extractCodeBlocks(filePath, content);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}: ${error.message}`);
    }
  }

  checkDeadFeatures(filePath, content) {
    const deadFeatures = [];
    
    // Check for buttons without onClick handlers
    const buttonMatches = content.matchAll(/<Button[^>]*>/g);
    for (const match of buttonMatches) {
      const buttonTag = match[0];
      if (!buttonTag.includes('onClick') && !buttonTag.includes('asChild') && !buttonTag.includes('type="submit"') && !buttonTag.includes('form=')) {
        deadFeatures.push({
          type: 'Dead Button',
          description: 'Button without onClick handler or navigation',
          line: this.getLineNumber(content, match.index),
          code: buttonTag.substring(0, 100) + '...'
        });
      }
    }

    // Check for Links without proper to prop
    const linkMatches = content.matchAll(/<Link[^>]*>/g);
    for (const match of linkMatches) {
      const linkTag = match[0];
      if (!linkTag.includes('to=')) {
        deadFeatures.push({
          type: 'Dead Link',
          description: 'Link component without to prop',
          line: this.getLineNumber(content, match.index),
          code: linkTag.substring(0, 100) + '...'
        });
      }
    }

    // Check for form inputs without proper handlers
    const inputMatches = content.matchAll(/<Input[^>]*>/g);
    for (const match of inputMatches) {
      const inputTag = match[0];
      if (!inputTag.includes('onChange') && !inputTag.includes('value') && !inputTag.includes('defaultValue')) {
        deadFeatures.push({
          type: 'Uncontrolled Input',
          description: 'Input without onChange handler or value binding',
          line: this.getLineNumber(content, match.index),
          code: inputTag.substring(0, 100) + '...'
        });
      }
    }

    // Check for useState without setter usage
    const stateMatches = content.matchAll(/const \[(\w+), set(\w+)\] = useState/g);
    for (const match of stateMatches) {
      const [, stateName, setterName] = match;
      const fullSetterName = `set${setterName}`;
      if (!content.includes(fullSetterName + '(')) {
        deadFeatures.push({
          type: 'Unused State Setter',
          description: `State setter '${fullSetterName}' is declared but never used`,
          line: this.getLineNumber(content, match.index),
          code: match[0]
        });
      }
    }

    if (deadFeatures.length > 0) {
      this.results.deadFeatures.push({
        file: filePath,
        issues: deadFeatures
      });
    }
  }

  checkMissingDebugSupport(filePath, content) {
    const debugIssues = [];
    
    // Check if page has debugging interface
    if (!content.includes('debugSettings') && !content.includes('DEBUG') && !content.includes('console.')) {
      debugIssues.push({
        type: 'No Debug Support',
        description: 'Page lacks debugging interface or error logging',
        severity: 'medium'
      });
    }

    // Check for proper error boundaries
    if (content.includes('useState') && !content.includes('try {') && !content.includes('catch (')) {
      debugIssues.push({
        type: 'Missing Error Handling',
        description: 'Component uses state but lacks error handling',
        severity: 'high'
      });
    }

    // Check for loading states
    if (content.includes('useEffect') && !content.includes('loading') && !content.includes('Loading')) {
      debugIssues.push({
        type: 'Missing Loading State',
        description: 'Async operations without loading indicators',
        severity: 'medium'
      });
    }

    // Check for TypeScript any usage
    const anyMatches = content.matchAll(/:\s*any\b/g);
    for (const match of anyMatches) {
      debugIssues.push({
        type: 'TypeScript Any',
        description: 'Using "any" type reduces type safety',
        line: this.getLineNumber(content, match.index),
        severity: 'low'
      });
    }

    if (debugIssues.length > 0) {
      this.results.missingDebug.push({
        file: filePath,
        issues: debugIssues
      });
    }
  }

  checkCodeSmells(filePath, content) {
    const smells = [];
    
    // Check for long functions
    const functionMatches = content.matchAll(/(?:function\s+\w+|const\s+\w+\s*=.*?=>|function\s*\()/g);
    for (const match of functionMatches) {
      const startIndex = match.index;
      const functionBody = this.extractFunctionBody(content, startIndex);
      const lineCount = functionBody.split('\n').length;
      
      if (lineCount > 50) {
        smells.push({
          type: 'Long Function',
          description: `Function has ${lineCount} lines (consider breaking down)`,
          line: this.getLineNumber(content, startIndex),
          severity: 'medium'
        });
      }
    }

    // Check for deeply nested components
    const jsxDepth = this.calculateMaxJSXDepth(content);
    if (jsxDepth > 8) {
      smells.push({
        type: 'Deep Nesting',
        description: `JSX nesting depth: ${jsxDepth} levels (consider component extraction)`,
        severity: 'medium'
      });
    }

    // Check for magic numbers
    const magicNumbers = content.matchAll(/[^.\w](\d{2,})[^.\w]/g);
    for (const match of magicNumbers) {
      const number = match[1];
      if (parseInt(number) > 10 && !['100', '200', '300', '400', '500'].includes(number)) {
        smells.push({
          type: 'Magic Number',
          description: `Magic number ${number} should be a named constant`,
          line: this.getLineNumber(content, match.index),
          severity: 'low'
        });
      }
    }

    if (smells.length > 0) {
      this.results.codeSmells.push({
        file: filePath,
        issues: smells
      });
    }
  }

  checkPerformanceIssues(filePath, content) {
    const issues = [];
    
    // Check for missing React.memo on components
    if (content.includes('export default function') && !content.includes('React.memo') && !content.includes('memo(')) {
      const componentName = content.match(/export default function (\w+)/)?.[1];
      if (componentName && this.hasPropsParameter(content)) {
        issues.push({
          type: 'Missing Memoization',
          description: `Component ${componentName} could benefit from React.memo`,
          severity: 'low'
        });
      }
    }

    // Check for inline object/array definitions in JSX
    const inlineObjectMatches = content.matchAll(/\{\s*\{[^}]+\}\s*\}/g);
    for (const match of inlineObjectMatches) {
      issues.push({
        type: 'Inline Object in JSX',
        description: 'Inline objects cause unnecessary re-renders',
        line: this.getLineNumber(content, match.index),
        severity: 'medium'
      });
    }

    // Check for multiple useEffect without dependencies
    const useEffectMatches = content.matchAll(/useEffect\([^,]+,\s*\[\s*\]/g);
    if (useEffectMatches.length > 2) {
      issues.push({
        type: 'Multiple Empty useEffect',
        description: 'Multiple useEffect with empty dependencies may cause performance issues',
        severity: 'medium'
      });
    }

    if (issues.length > 0) {
      this.results.performance.push({
        file: filePath,
        issues: issues
      });
    }
  }

  checkAccessibilityIssues(filePath, content) {
    const issues = [];
    
    // Check for images without alt text
    const imgMatches = content.matchAll(/<img[^>]*>/g);
    for (const match of imgMatches) {
      if (!match[0].includes('alt=')) {
        issues.push({
          type: 'Missing Alt Text',
          description: 'Image without alt attribute',
          line: this.getLineNumber(content, match.index),
          severity: 'high'
        });
      }
    }

    // Check for buttons without accessible names
    const buttonMatches = content.matchAll(/<Button[^>]*>([^<]*)<\/Button>/g);
    for (const match of buttonMatches) {
      const buttonContent = match[1].trim();
      const buttonTag = match[0];
      if (!buttonContent && !buttonTag.includes('aria-label') && !buttonTag.includes('title')) {
        issues.push({
          type: 'Inaccessible Button',
          description: 'Button without accessible name or content',
          line: this.getLineNumber(content, match.index),
          severity: 'high'
        });
      }
    }

    // Check for form inputs without labels
    const inputMatches = content.matchAll(/<Input[^>]*id=["']([^"']+)["'][^>]*>/g);
    for (const match of inputMatches) {
      const inputId = match[1];
      if (!content.includes(`htmlFor="${inputId}"`) && !content.includes(`htmlFor='${inputId}'`)) {
        issues.push({
          type: 'Input Without Label',
          description: `Input with id="${inputId}" has no associated label`,
          line: this.getLineNumber(content, match.index),
          severity: 'high'
        });
      }
    }

    if (issues.length > 0) {
      this.results.accessibility.push({
        file: filePath,
        issues: issues
      });
    }
  }

  extractCodeBlocks(filePath, content) {
    // Extract function signatures and component structures for duplication detection
    const functions = content.matchAll(/(?:function\s+(\w+)|const\s+(\w+)\s*=)/g);
    for (const match of functions) {
      const funcName = match[1] || match[2];
      const startIndex = match.index;
      const funcBody = this.extractFunctionBody(content, startIndex);
      const signature = this.normalizeCode(funcBody.substring(0, 200));
      
      if (!this.codeBlocks.has(signature)) {
        this.codeBlocks.set(signature, []);
      }
      
      this.codeBlocks.get(signature).push({
        file: filePath,
        function: funcName,
        line: this.getLineNumber(content, startIndex),
        code: funcBody.substring(0, 100) + '...'
      });
    }
  }

  detectDuplications() {
    for (const [signature, occurrences] of this.codeBlocks.entries()) {
      if (occurrences.length > 1) {
        this.results.duplications.push({
          signature: signature.substring(0, 50) + '...',
          occurrences: occurrences,
          severity: occurrences.length > 2 ? 'high' : 'medium'
        });
      }
    }
  }

  // Helper methods
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  extractFunctionBody(content, startIndex) {
    let braceCount = 0;
    let inFunction = false;
    let result = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      result += char;
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
          break;
        }
      }
    }
    
    return result;
  }

  calculateMaxJSXDepth(content) {
    let maxDepth = 0;
    let currentDepth = 0;
    let inJSX = false;
    
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '<' && content[i + 1] !== '/') {
        if (content.substring(i).match(/^<[A-Z]/)) {
          currentDepth++;
          inJSX = true;
          maxDepth = Math.max(maxDepth, currentDepth);
        }
      } else if (content[i] === '<' && content[i + 1] === '/') {
        if (inJSX) currentDepth--;
      }
    }
    
    return maxDepth;
  }

  hasPropsParameter(content) {
    return content.includes('function') && (content.includes('(props') || content.includes('({'));
  }

  normalizeCode(code) {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\/\*.*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
  }

  generateReport() {
    console.log('\n📊 ADVANCED CODE ANALYSIS REPORT');
    console.log('================================\n');
    
    // Summary
    const totalIssues = 
      this.results.duplications.length +
      this.results.deadFeatures.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.missingDebug.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.codeSmells.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.performance.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.accessibility.reduce((sum, f) => sum + f.issues.length, 0);

    console.log(`📈 Files Analyzed: ${this.files.length}`);
    console.log(`🚨 Total Issues Found: ${totalIssues}\n`);

    // Duplications
    if (this.results.duplications.length > 0) {
      console.log('🔄 CODE DUPLICATIONS:');
      this.results.duplications.forEach(dup => {
        console.log(`  ${dup.severity === 'high' ? '🚨' : '⚠️'} Signature: ${dup.signature}`);
        console.log(`     Found in ${dup.occurrences.length} locations:`);
        dup.occurrences.forEach(occ => {
          console.log(`     - ${basename(occ.file)}:${occ.line} (${occ.function})`);
        });
        console.log('');
      });
    }

    // Dead Features
    this.reportSection('💀 DEAD FEATURES:', this.results.deadFeatures);
    
    // Missing Debug Support
    this.reportSection('🐛 MISSING DEBUG SUPPORT:', this.results.missingDebug);
    
    // Code Smells
    this.reportSection('🦨 CODE SMELLS:', this.results.codeSmells);
    
    // Performance Issues
    this.reportSection('⚡ PERFORMANCE ISSUES:', this.results.performance);
    
    // Accessibility Issues
    this.reportSection('♿ ACCESSIBILITY ISSUES:', this.results.accessibility);
  }

  reportSection(title, data) {
    if (data.length > 0) {
      console.log(title);
      data.forEach(fileData => {
        console.log(`  📄 ${basename(fileData.file)}:`);
        fileData.issues.forEach(issue => {
          const severityIcon = issue.severity === 'high' ? '🚨' : 
                              issue.severity === 'medium' ? '⚠️' : 'ℹ️';
          console.log(`     ${severityIcon} ${issue.type}: ${issue.description}`);
          if (issue.line) console.log(`        Line: ${issue.line}`);
          if (issue.code) console.log(`        Code: ${issue.code}`);
        });
        console.log('');
      });
    }
  }

  generateDebugDashboard() {
    const dashboardContent = this.createDebugDashboardContent();
    
    try {
      writeFileSync('debug-dashboard.html', dashboardContent);
      console.log('📋 Debug Dashboard generated: debug-dashboard.html');
    } catch (error) {
      console.error('Failed to generate debug dashboard:', error.message);
    }
  }

  createDebugDashboardContent() {
    const totalIssues = 
      this.results.duplications.length +
      this.results.deadFeatures.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.missingDebug.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.codeSmells.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.performance.reduce((sum, f) => sum + f.issues.length, 0) +
      this.results.accessibility.reduce((sum, f) => sum + f.issues.length, 0);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Quality Debug Dashboard</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .section { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .section-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #dee2e6; font-weight: bold; }
        .issue { padding: 15px; border-bottom: 1px solid #eee; }
        .issue:last-child { border-bottom: none; }
        .severity-high { border-left: 4px solid #dc3545; }
        .severity-medium { border-left: 4px solid #ffc107; }
        .severity-low { border-left: 4px solid #28a745; }
        .file-name { font-weight: bold; color: #495057; }
        .issue-type { color: #007bff; font-weight: 500; }
        .code-snippet { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; margin-top: 8px; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Code Quality Debug Dashboard</h1>
            <p>Advanced analysis results for Spyder Layout project</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${this.files.length}</div>
                <div>Files Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalIssues}</div>
                <div>Total Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.results.duplications.length}</div>
                <div>Code Duplications</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.results.deadFeatures.reduce((sum, f) => sum + f.issues.length, 0)}</div>
                <div>Dead Features</div>
            </div>
        </div>
        
        ${this.generateDashboardSection('🔄 Code Duplications', this.results.duplications, 'duplications')}
        ${this.generateDashboardSection('💀 Dead Features', this.results.deadFeatures, 'issues')}
        ${this.generateDashboardSection('🐛 Debug Issues', this.results.missingDebug, 'issues')}
        ${this.generateDashboardSection('🦨 Code Smells', this.results.codeSmells, 'issues')}
        ${this.generateDashboardSection('⚡ Performance', this.results.performance, 'issues')}
        ${this.generateDashboardSection('♿ Accessibility', this.results.accessibility, 'issues')}
        
        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }

  generateDashboardSection(title, data, type) {
    if (data.length === 0) return '';
    
    let content = `<div class="section">
        <div class="section-header">${title}</div>`;
    
    if (type === 'duplications') {
      data.forEach(dup => {
        content += `<div class="issue severity-${dup.severity}">
            <div class="issue-type">Duplicate Code Pattern</div>
            <div>Found in ${dup.occurrences.length} locations:</div>
            <ul>
                ${dup.occurrences.map(occ => 
                  `<li><span class="file-name">${basename(occ.file)}</span>:${occ.line} (${occ.function})</li>`
                ).join('')}
            </ul>
        </div>`;
      });
    } else {
      data.forEach(fileData => {
        fileData.issues.forEach(issue => {
          content += `<div class="issue severity-${issue.severity || 'medium'}">
              <div class="file-name">${basename(fileData.file)}</div>
              <div class="issue-type">${issue.type}</div>
              <div>${issue.description}</div>
              ${issue.line ? `<div>Line: ${issue.line}</div>` : ''}
              ${issue.code ? `<div class="code-snippet">${issue.code}</div>` : ''}
          </div>`;
        });
      });
    }
    
    content += '</div>';
    return content;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const targetPath = process.argv[2] || './src';
  
  console.log(`🚀 Starting advanced code analysis on: ${targetPath}\n`);
  
  const checker = new AdvancedCodeChecker(targetPath);
  checker.checkAll().then(() => {
    console.log('\n✅ Analysis complete! Check debug-dashboard.html for detailed results.');
  }).catch(error => {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  });
}

export default AdvancedCodeChecker;
