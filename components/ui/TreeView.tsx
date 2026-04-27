'use client';

interface TreeNode {
  _id: string;
  name: string;
  memberId: string;
  role: string;
  rank: string;
  status: string;
  personalSalesCount: number;
  teamSize: number;
  children: TreeNode[];
}

interface TreeViewProps {
  nodes: TreeNode[];
  depth?: number;
}

const RANK_COLORS: Record<string, string> = {
  HCC: 'border-blue-500 bg-blue-500/10 text-blue-300',
  HCM: 'border-purple-500 bg-purple-500/10 text-purple-300',
  HBA: 'border-orange-500 bg-orange-500/10 text-orange-300',
  SH: 'border-pink-500 bg-pink-500/10 text-pink-300',
  ADMIN: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
};

function TreeNodeCard({ node, depth }: { node: TreeNode; depth: number }) {
  const color = RANK_COLORS[node.rank] || 'border-slate-600 bg-slate-800 text-slate-300';

  return (
    <div className="relative">
      {/* Connector line from parent */}
      {depth > 0 && (
        <div className="absolute left-[-20px] top-4 w-5 h-px bg-slate-600" />
      )}

      <div className={`border rounded-xl p-3 text-sm w-48 ${color} flex-shrink-0`}>
        <p className="font-bold text-white text-xs">{node.name}</p>
        <p className="font-mono text-[10px] opacity-70">{node.memberId}</p>
        <div className="flex gap-2 mt-2 text-[10px]">
          <span>Sales: {node.personalSalesCount}</span>
          <span>Team: {node.teamSize}</span>
        </div>
        <span className={`mt-1 inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium
          ${node.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {node.status}
        </span>
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="relative mt-2 ml-6 pl-4 border-l border-slate-600 space-y-2">
          {node.children.map((child) => (
            <TreeNodeCard key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ nodes, depth = 0 }: TreeViewProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8 text-sm">
        No downline members yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="space-y-3 min-w-max p-2">
        {nodes.map((node) => (
          <TreeNodeCard key={node._id} node={node} depth={depth} />
        ))}
      </div>
    </div>
  );
}
