import { OrgChartNodeData } from '@/components/org-charts/OrgChartNode';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'svg' | 'csv';
  includeContacts?: boolean;
  includeHierarchy?: boolean;
  theme?: 'light' | 'dark';
}

export function exportOrgChart(
  hierarchy: OrgChartNodeData[], 
  companyName: string, 
  options: ExportOptions = { format: 'png' }
): void {
  switch (options.format) {
    case 'csv':
      exportToCSV(hierarchy, companyName);
      break;
    case 'pdf':
      exportToPDF(hierarchy, companyName, options);
      break;
    case 'png':
    case 'svg':
      exportToImage(hierarchy, companyName, options);
      break;
    default:
      console.error('Unsupported export format');
  }
}

function exportToCSV(hierarchy: OrgChartNodeData[], companyName: string): void {
  const flattenHierarchy = (nodes: OrgChartNodeData[], parentName: string = ''): any[] => {
    const result: any[] = [];
    
    nodes.forEach(node => {
      result.push({
        name: node.name,
        title: node.title,
        department: node.department || '',
        seniority: node.seniority || '',
        email: node.email || '',
        phone: node.phone || '',
        level: node.level,
        manager: parentName,
        directReports: node.managerOf || 0
      });
      
      if (node.children && node.children.length > 0) {
        result.push(...flattenHierarchy(node.children, node.name));
      }
    });
    
    return result;
  };

  const data = flattenHierarchy(hierarchy);
  const headers = ['Name', 'Title', 'Department', 'Seniority', 'Email', 'Phone', 'Level', 'Manager', 'Direct Reports'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const key = header.toLowerCase().replace(' ', '');
        const value = row[key === 'directreports' ? 'directReports' : key] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csvContent, `${companyName}_org_chart.csv`, 'text/csv');
}

function exportToPDF(hierarchy: OrgChartNodeData[], companyName: string, options: ExportOptions): void {
  // This would require a library like jsPDF or similar
  // For now, we'll create a simple HTML version that can be printed to PDF
  const htmlContent = generatePrintableHTML(hierarchy, companyName, options);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

function exportToImage(hierarchy: OrgChartNodeData[], companyName: string, options: ExportOptions): void {
  // This would require html2canvas or similar library for actual image generation
  // For now, we'll show a placeholder
  alert('Image export feature coming soon! Please use PDF export for now.');
}

function generatePrintableHTML(hierarchy: OrgChartNodeData[], companyName: string, options: ExportOptions): string {
  const renderNode = (node: OrgChartNodeData, level: number = 0): string => {
    const indentation = '  '.repeat(level);
    const childrenHtml = node.children && node.children.length > 0 
      ? node.children.map(child => renderNode(child, level + 1)).join('')
      : '';
    
    return `
      <div class="org-node" style="margin-left: ${level * 20}px; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: ${level === 0 ? '#f8f9fa' : 'white'};">
        <div style="font-weight: bold; color: #333;">${node.name}</div>
        <div style="color: #666; font-size: 14px;">${node.title}</div>
        ${node.department ? `<div style="color: #888; font-size: 12px;">${node.department}</div>` : ''}
        ${node.email ? `<div style="color: #888; font-size: 12px;">${node.email}</div>` : ''}
        ${node.managerOf ? `<div style="color: #666; font-size: 12px;">Manages ${node.managerOf} people</div>` : ''}
        ${childrenHtml}
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${companyName} - Organization Chart</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .org-node {
            break-inside: avoid;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${companyName}</h1>
          <h2>Organization Chart</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="org-chart">
          ${hierarchy.map(node => renderNode(node)).join('')}
        </div>
      </body>
    </html>
  `;
}

function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}

export function searchOrgChart(
  hierarchy: OrgChartNodeData[], 
  query: string, 
  filters: {
    department?: string;
    seniority?: string;
    location?: string;
  } = {}
): OrgChartNodeData[] {
  const searchRecursive = (nodes: OrgChartNodeData[]): OrgChartNodeData[] => {
    return nodes.filter(node => {
      const matchesQuery = !query || 
        node.name.toLowerCase().includes(query.toLowerCase()) ||
        node.title.toLowerCase().includes(query.toLowerCase()) ||
        node.email?.toLowerCase().includes(query.toLowerCase()) ||
        node.department?.toLowerCase().includes(query.toLowerCase());
      
      const matchesDepartment = !filters.department || node.department === filters.department;
      const matchesSeniority = !filters.seniority || node.seniority === filters.seniority;
      const matchesLocation = !filters.location || node.location === filters.location;
      
      const nodeMatches = matchesQuery && matchesDepartment && matchesSeniority && matchesLocation;
      
      // Filter children recursively
      const filteredChildren = node.children ? searchOrgChart(node.children, query, filters) : [];
      
      // Include node if it matches OR if any of its children match
      if (nodeMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          isExpanded: filteredChildren.length > 0 ? true : node.isExpanded
        };
      }
      
      return false;
    }).filter(Boolean) as OrgChartNodeData[];
  };

  return searchRecursive(hierarchy);
}

export function getOrgChartStats(hierarchy: OrgChartNodeData[]): {
  totalEmployees: number;
  departmentCounts: Record<string, number>;
  seniorityLevels: Record<string, number>;
  averageDirectReports: number;
  maxHierarchyDepth: number;
} {
  let totalEmployees = 0;
  const departmentCounts: Record<string, number> = {};
  const seniorityLevels: Record<string, number> = {};
  let totalDirectReports = 0;
  let managersCount = 0;
  let maxDepth = 0;

  const traverse = (nodes: OrgChartNodeData[], depth: number = 0) => {
    maxDepth = Math.max(maxDepth, depth);
    
    nodes.forEach(node => {
      totalEmployees++;
      
      if (node.department) {
        departmentCounts[node.department] = (departmentCounts[node.department] || 0) + 1;
      }
      
      if (node.seniority) {
        seniorityLevels[node.seniority] = (seniorityLevels[node.seniority] || 0) + 1;
      }
      
      if (node.managerOf && node.managerOf > 0) {
        totalDirectReports += node.managerOf;
        managersCount++;
      }
      
      if (node.children && node.children.length > 0) {
        traverse(node.children, depth + 1);
      }
    });
  };

  traverse(hierarchy);

  return {
    totalEmployees,
    departmentCounts,
    seniorityLevels,
    averageDirectReports: managersCount > 0 ? Math.round(totalDirectReports / managersCount * 10) / 10 : 0,
    maxHierarchyDepth: maxDepth
  };
}

export function formatDepartment(department: string): string {
  return department
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatSeniority(seniority: string): string {
  return seniority
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getSeniorityOrder(seniority: string): number {
  const order: Record<string, number> = {
    'FOUNDER_OWNER': 0,
    'C_LEVEL': 1,
    'EVP': 2,
    'SVP': 3,
    'VP': 4,
    'SENIOR_DIRECTOR': 5,
    'DIRECTOR': 6,
    'SENIOR_MANAGER': 7,
    'MANAGER': 8,
    'SENIOR_SPECIALIST': 9,
    'SPECIALIST': 10,
    'COORDINATOR': 11,
    'INTERN': 12
  };
  return order[seniority] ?? 99;
}