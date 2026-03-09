export function createPageUrl(pageName) {
  const pageMap = {
    Agents: '/agents',
    Transactions: '/transactions',
    Volume: '/volume',
    Skills: '/skills',
  };
  return pageMap[pageName] || `/${pageName.toLowerCase()}`;
}
