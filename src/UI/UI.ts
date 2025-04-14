export const model = {
  App: undefined as undefined | HTMLDivElement,
};

export const template = `
<style> 
   canvas {
       user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      -moz-user-select: none;

      -webkit-touch-callout: none; /* disables long-press context menu on iOS Safari */
   }
</style> 
<div \${==>App}> 
    <canvas id='cnv'> </canvas> 
</div>`;
