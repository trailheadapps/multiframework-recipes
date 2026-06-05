/// <reference types="vite/client" />

declare module '*?shiki' {
  const html: string;
  export default html;
}

declare module '*?shiki=js' {
  const html: string;
  export default html;
}

declare module '*?shiki=html' {
  const html: string;
  export default html;
}
