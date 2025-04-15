class GameUI {
  startbutton = () => {
    this.owner?.enemyWaveManager?.startWave();
  };
  stopbutton = () => {
    this.owner?.enemyWaveManager?.endWave();
  };
  switchButton = () => {
    this.owner?.switchPlayerFocus();
  };

  register = (owner: GameScene) => {
    this.owner = owner;
  };

  owner: GameScene | undefined;

  static template = `
      <style> 
          #gameUI{
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
           user-select: none;
           -webkit-user-select: none;
          -ms-user-select: none;
          -moz-user-select: none;
  
          -webkit-touch-callout: none; /* disables long-press context menu on iOS Safari */
          }
  
          #gameUI button{
            pointer-events: all;
          }
      </style> 
      <div id='gameUI'> 
           
      </div>`;
}
/*
          <button style="margin-left: 10px; margin-top: 20px" \${click@=>startbutton}>Start</button>
          <button style="margin-left: 10px; margin-top: 20px" \${click@=>stopbutton}>Stop</button>
          <button style="margin-left: 10px; margin-top: 20px" \${click@=>switchButton}>Switch</button>
  */
