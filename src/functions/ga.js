export const greedyPlacement = (matrix) => {
  const n = matrix.length;
  // Збираємо всі ваги > 0 у масив
  const weights = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] > 0) weights.push(matrix[i][j]);
    }
  }
  // Сортуємо ваги за спаданням
  weights.sort((a, b) => b - a);

  // Генеруємо спіральний порядок індексів (для парних і непарних n)
  function spiralOrder(n) {
    const res = [];
    const visited = Array.from({ length: n }, () => Array(n).fill(false));
    let dirs = [
      [0, 1], // вправо
      [1, 0], // вниз
      [0, -1], // вліво
      [-1, 0], // вгору
    ];
    let x, y;
    if (n % 2 === 1) {
      x = y = Math.floor(n / 2);
    } else {
      x = n / 2 - 1;
      y = n / 2 - 1;
    }
    let dir = 0,
      steps = 1,
      cnt = 0;
    res.push([x, y]);
    visited[x][y] = true;
    if (n % 2 === 0) {
      // Для парних n додаємо ще 3 центральні клітинки
      const centers = [
        [x, y + 1],
        [x + 1, y + 1],
        [x + 1, y],
      ];
      for (const [cx, cy] of centers) {
        res.push([cx, cy]);
        visited[cx][cy] = true;
      }
      cnt = 4;
      x = x + 1; // остання додана координата
      y = y;
    } else {
      cnt = 1;
    }
    while (cnt < n * n) {
      for (let d = 0; d < 2; d++) {
        for (let s = 0; s < steps; s++) {
          x += dirs[dir][0];
          y += dirs[dir][1];
          if (x >= 0 && x < n && y >= 0 && y < n && !visited[x][y]) {
            res.push([x, y]);
            visited[x][y] = true;
            cnt++;
          }
        }
        dir = (dir + 1) % 4;
      }
      steps++;
    }
    return res;
  }

  // Створюємо новий масив розміщення
  const placement = Array.from({ length: n }, () => Array(n).fill(0));
  const spiral = spiralOrder(n);
  for (let k = 0; k < weights.length && k < spiral.length; k++) {
    const [i, j] = spiral[k];
    placement[i][j] = weights[k];
  }

  // Функція для обчислення відстані до кута (мінімальна з 4-х)
  function dist(i, j, ci, cj) {
    return Math.abs(i - ci) + Math.abs(j - cj) || 1;
  }

  // Масив сил у кутах
  const cornersCoords = [
    [0, 0],
    [0, n - 1],
    [n - 1, 0],
    [n - 1, n - 1],
  ];
  const corners = cornersCoords.map(([ci, cj]) => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (placement[i][j] > 0) {
          const d = dist(i, j, ci, cj);
          sum += placement[i][j] / d;
        }
      }
    }
    return sum;
  });

  // Цільова функція: різниця між max та min силою у кутах
  const cf = Math.max(...corners) - Math.min(...corners);

  return { placement, corners, cf };
};
