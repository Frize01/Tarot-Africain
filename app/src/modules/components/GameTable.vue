<template>
  <div class="table-environment">
    <div class="vignette"></div>

    <div class="board-container">
      <div class="board-surface">
        <slot name="board"></slot>
      </div>
    </div>

    <div class="foreground">
      <slot name="hand"></slot>
    </div>
  </div>
</template>

<style scoped>
  .table-environment {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle, #1a3a2a 70%, #050505 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    perspective: 400px;
  }

  @media (max-width: 500px) {
    .table-environment {
      perspective: 250px;
    }
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%);
    pointer-events: none;
    z-index: 10;
  }

  .board-container {
    transform: rotateX(60deg) translateY(-10%);
    width: 95%;
    max-width: 900px;
    aspect-ratio: 3 / 2;
    z-index: 1;
  }

  .board-surface {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #35654d 0%, #1a3a2a 100%);
    border: 8px solid #234333;
    border-radius: 100%;
    box-shadow:
      0 30px 60px rgba(0,0,0,0.8),
      inset 0 0 100px rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .foreground {
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 20;
  }

  @media (max-width: 600px) {
    .board-container {
      transform: rotateX(55deg) translateY(-5%);
      width: 120%;
    }
  }
</style>
