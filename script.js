class CA {
  constructor(opts) {
    const { mountNode, width, onGenerationComplete, maxGenerations } = opts;
    const MAX_ALLOWED_GENERATIONS = 3000;

    this.width = width;
    this.cells = new Array(width);
    this.mountNode = mountNode;
    this.maxGenerations =
      maxGenerations >= MAX_ALLOWED_GENERATIONS
        ? MAX_ALLOWED_GENERATIONS
        : maxGenerations;
    this.onGenerationComplete = onGenerationComplete;
    this.rule = 0;
    this.numGenerations = 0;
    this.interval = null;
    this.isRunning = false;
  }

  getBit(num, pos) {
    return (num >> pos) & 1;
  }

  combine(b1, b2, b3) {
    return (b1 << 2) + (b2 << 1) + (b3 << 0);
  }

  getRule(n) {
    return (b1, b2, b3) => this.getBit(n, this.combine(b1, b2, b3));
  }

  getIsRunning() {
    return this.isRunning;
  }

  getNumGenerations() {
    return this.numGenerations;
  }

  start(ruleNumber) {
    this.isRunning = true;
    this.rule = this.getRule(ruleNumber);

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = 0;
    }

    this.cells[this.cells.length / 2] = 1;
    this.draw(this.cells);

    this.interval = setInterval(() => {
      this.generate();
    }, 20);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.interval);
    this.onGenerationComplete();
  }

  reset() {
    this.numGenerations = 0;
    this.stop();
    this.cells = new Array(this.width);
    this.mountNode.innerHTML = '';
  }

  generate() {
    if (this.numGenerations >= this.maxGenerations - 1) {
      this.stop();
    }

    const nextGen = new Array(this.cells.length);

    for (let i = 0; i < this.cells.length; i++) {
      const left = this.cells[i - 1] ?? 0;
      const current = this.cells[i];
      const right = this.cells[i + 1] ?? 0;

      nextGen[i] = this.rule(left, current, right);
    }

    this.draw(nextGen);
    this.cells = nextGen;
    this.numGenerations++;
    this.onGenerationComplete();
  }

  draw(row) {
    const rowEl = document.createElement('div');

    for (let i = 0; i < row.length; i++) {
      const cell = document.createElement('div');

      cell.classList.add('cell');
      if (row[i] === 1) cell.classList.add('alive');
      rowEl.appendChild(cell);
    }

    this.mountNode.appendChild(rowEl);
  }
}

window.onload = () => {
  const $world = document.querySelector('#world');
  const $form = document.querySelector('form');
  const $input = document.querySelector('input');
  const $btnStart = document.querySelector('#btn-start');
  const $btnReset = document.querySelector('#btn-reset');
  const $generations = document.querySelector('#generations');
  const ca = new CA({
    mountNode: $world,
    maxGenerations: 999999999999999,
    width: 100,
    onGenerationComplete: () => {
      $generations.textContent = ca.getNumGenerations();
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!ca.getIsRunning()) {
      ca.start($input.value);
      $btnStart.textContent = 'Stop';
    } else {
      ca.stop();
      $btnStart.textContent = 'Start';
    }
  };

  const handleReset = () => {
    ca.reset();
    $btnStart.textContent = 'Start';
  };

  $form.addEventListener(
    'submit',
    (event) => {
      handleSubmit(event);
    },
    false,
  );

  $btnReset.addEventListener('click', handleReset, false);
};
