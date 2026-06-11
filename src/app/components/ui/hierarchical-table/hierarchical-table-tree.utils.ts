export interface TreeNode<T> {
    data: T;
    children: TreeNode<T>[];
    depth: number;
    expanded: boolean;
  }
  
  export function buildTree<T extends Record<string, any>>(
    data: T[],
    idKey: string,
    parentKey: string,
  ): TreeNode<T>[] {
    const nodeMap = new Map<any, TreeNode<T>>();
  
    for (const item of data) {
      nodeMap.set(item[idKey], {
        data: item,
        children: [],
        depth: 0,
        expanded: true,
      });
    }
  
    const roots: TreeNode<T>[] = [];
    for (const item of data) {
      const node = nodeMap.get(item[idKey])!;
      const parentId = item[parentKey];
      if (parentId != null && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
  
    setDepth(roots, 0);
    return roots;
  }
  
  export function flattenTree<T extends Record<string, any>>(nodes: TreeNode<T>[], query = ''): TreeNode<T>[] {
    const q = query.trim().toLowerCase();
    const roots = q ? filterTree(nodes, q) : nodes;
    return flattenVisible(roots);
  }
  
  export function setAllExpanded<T>(nodes: TreeNode<T>[], value: boolean): void {
    for (const node of nodes) {
      node.expanded = value;
      setAllExpanded(node.children, value);
    }
  }
  
  // ── Internas ───────────────────────────────────────────────────────────────────
  
  function setDepth<T>(nodes: TreeNode<T>[], depth: number): void {
    for (const node of nodes) {
      node.depth = depth;
      setDepth(node.children, depth + 1);
    }
  }
  
  function flattenVisible<T>(nodes: TreeNode<T>[]): TreeNode<T>[] {
    const result: TreeNode<T>[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.expanded && node.children.length > 0) {
        result.push(...flattenVisible(node.children));
      }
    }
    return result;
  }
  
  function filterTree<T extends Record<string, any>>(
    nodes: TreeNode<T>[],
    q: string,
  ): TreeNode<T>[] {
    const result: TreeNode<T>[] = [];
    for (const node of nodes) {
      const filteredChildren = filterTree(node.children, q);
      const matches = Object.values(node.data).some(
        v => v != null && String(v).toLowerCase().includes(q)
      );
      if (matches || filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren, expanded: true });
      }
    }
    return result;
  }