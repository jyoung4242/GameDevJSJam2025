export const model = {
  App: undefined as undefined | HTMLDivElement,
};

export const template = `
<style> 
   canvas {
     user-select: none;
   }
</style> 
<div \${==>App}> 
    <canvas id='cnv'> </canvas> 
</div>`;
