export const model = {
  App: undefined as undefined | HTMLDivElement,
};

export const template = `
<style> 
    canvas{ 
        position: fixed; 
        top:50%; 
        left:50%; 
        transform: translate(-50% , -50%);
    }
</style> 
<div \${==>App}> 
    <canvas id='cnv'> </canvas> 
</div>`;
