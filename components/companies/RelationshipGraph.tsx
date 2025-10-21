'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface RelationshipGraphProps {
  companyId: string;
  includeContacts?: boolean;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// Custom node component for companies
const CompanyNode = ({ data }: any) => {
  const { name, companyType, logoUrl, isCentral } = data;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-md bg-white ${
        isCentral
          ? 'border-blue-600 ring-2 ring-blue-200'
          : companyType === 'AGENCY'
          ? 'border-purple-500'
          : 'border-green-500'
      }`}
      style={{ minWidth: 180 }}
    >
      <div className="flex items-center gap-2">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={name}
            className="w-8 h-8 rounded object-cover"
          />
        )}
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-gray-500">{companyType}</div>
        </div>
      </div>
    </div>
  );
};

// Custom node component for contacts
const ContactNode = ({ data }: any) => {
  const { fullName, title, logoUrl } = data;

  return (
    <div
      className="px-3 py-2 rounded-md border border-gray-300 shadow-sm bg-gray-50"
      style={{ minWidth: 150 }}
    >
      <div className="flex items-center gap-2">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={fullName}
            className="w-6 h-6 rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-medium text-xs">{fullName}</div>
          <div className="text-xs text-gray-500 truncate">{title}</div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  company: CompanyNode,
  contact: ContactNode,
};

export function RelationshipGraph({ companyId, includeContacts = true }: RelationshipGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchRelationships() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/orgs/companies/${companyId}/relationships?includeContacts=${includeContacts}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch relationships');
        }

        const data = await response.json();

        // Convert to React Flow format
        const flowNodes: Node[] = data.graph.nodes.map((node: any, index: number) => {
          // Calculate position using a circular/hierarchical layout
          const centerX = 500;
          const centerY = 300;
          const radius = node.group === 'central' ? 0 : 250;
          const angle = (index * 2 * Math.PI) / Math.max(data.graph.nodes.length - 1, 1);

          let x = centerX;
          let y = centerY;

          if (node.group !== 'central') {
            x = centerX + radius * Math.cos(angle);
            y = centerY + radius * Math.sin(angle);
          }

          return {
            id: node.id,
            type: node.type === 'company' ? 'company' : 'contact',
            data: node.data,
            position: { x, y },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          };
        });

        const flowEdges: Edge[] = data.graph.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: 'smoothstep',
          animated: edge.type === 'agency_client',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edge.type === 'agency_client' ? '#8b5cf6' : '#6b7280',
          },
          style: {
            stroke: edge.type === 'agency_client' ? '#8b5cf6' : '#6b7280',
            strokeWidth: edge.type === 'parent_child' ? 3 : 2,
          },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
        setStats(data.stats);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching relationships:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRelationships();
  }, [companyId, includeContacts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading relationship graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600">Error loading graph: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isCentral) return '#2563eb';
            if (node.type === 'company') return '#8b5cf6';
            return '#6b7280';
          }}
        />
      </ReactFlow>

      {stats && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 text-sm">
          <div className="font-semibold mb-2">Graph Stats</div>
          <div className="space-y-1 text-xs">
            <div>Total Nodes: {stats.totalNodes}</div>
            <div>Companies: {stats.companies}</div>
            <div>Contacts: {stats.contacts}</div>
            <div>Relationships: {stats.totalEdges}</div>
          </div>
        </div>
      )}
    </div>
  );
}
