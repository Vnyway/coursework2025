export const stochasticPlacement = (matrix, t = 1000) => {
  const n = matrix.length;
  // Збираємо всі ваги > 0 у масив
  const weights = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] > 0) weights.push(matrix[i][j]);
    }
  }

  // Функція для обчислення відстані до кута (мінімальна з 4-х)
  function dist(i, j, ci, cj) {
    return Math.abs(i - ci) + Math.abs(j - cj) || 1;
  }

  // Масив координат кутів
  const cornersCoords = [
    [0, 0],
    [0, n - 1],
    [n - 1, 0],
    [n - 1, n - 1],
  ];

  let bestCf = Infinity;
  let bestPlacement = null;
  let bestCorners = null;

  for (let iter = 0; iter < t; iter++) {
    // Створюємо порожню платформу
    const placement = Array.from({ length: n }, () => Array(n).fill(0));
    // Всі координати платформи
    const coords = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        coords.push([i, j]);
      }
    }
    // Перемішуємо координати
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coords[i], coords[j]] = [coords[j], coords[i]];
    }
    // Розміщуємо ваги у випадкових координатах
    for (let k = 0; k < weights.length && k < coords.length; k++) {
      const [i, j] = coords[k];
      placement[i][j] = weights[k];
    }
    // Обчислюємо сили у кутах
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
    // Обчислюємо цільову функцію
    const cf = Math.max(...corners) - Math.min(...corners);
    // Якщо краще — зберігаємо
    if (cf < bestCf) {
      bestCf = cf;
      bestPlacement = placement.map((row) => row.slice());
      bestCorners = corners.slice();
    }
  }

  return { placement: bestPlacement, corners: bestCorners, cf: bestCf };
};
