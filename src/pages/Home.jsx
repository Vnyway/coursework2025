import React from "react";
import { greedyPlacement, stochasticPlacement } from "../functions";

const Home = () => {
  const [inputMode, setInputMode] = React.useState("manual");
  const [size, setSize] = React.useState(3);
  const [matrix, setMatrix] = React.useState(
    Array(3)
      .fill()
      .map(() => Array(3).fill(1))
  );
  const [iterations, setIterations] = React.useState(100);

  // For auto generation
  const [minWeight, setMinWeight] = React.useState(1);
  const [maxWeight, setMaxWeight] = React.useState(10);

  // Results state
  const [results, setResults] = React.useState({
    greedy: null,
    stochastic: null,
  });

  // Save task as JSON
  const handleSave = () => {
    const data = {
      size,
      matrix,
      minWeight,
      maxWeight,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "task.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export result as JSON
  const handleExportResult = (type) => {
    const result = results[type];
    if (!result) return;
    const data = {
      size: size,
      placement: result.placement,
      algorithm: type === "greedy" ? "GA" : "SA",
      corners: result.corners,
      cf: result.cf,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `result_${type}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load task from JSON
  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (
          typeof data.size === "number" &&
          Array.isArray(data.matrix) &&
          data.matrix.length === data.size
        ) {
          setSize(data.size);
          setMatrix(data.matrix);
          setMinWeight(data.minWeight ?? 1);
          setMaxWeight(data.maxWeight ?? 10);
        } else {
          alert("Некоректний формат файлу.");
        }
      } catch {
        alert("Помилка при читанні файлу.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Update matrix size
  const handleSizeChange = (e) => {
    const n = Math.max(1, parseInt(e.target.value, 10) || 1);
    setSize(n);
    setMatrix(
      Array(n)
        .fill()
        .map(() => Array(n).fill(1))
    );
  };

  // Update matrix cell
  const handleMatrixChange = (row, col, value) => {
    let val = parseInt(value, 10);
    if (isNaN(val) || val < 1) val = 1;
    const newMatrix = matrix.map((arr) => arr.slice());
    newMatrix[row][col] = val;
    setMatrix(newMatrix);
  };

  // Handle iterations change
  const handleIterationsChange = (e) => {
    setIterations(e.target.value);
  };

  // Handle input mode change
  const handleInputModeChange = (e) => {
    setInputMode(e.target.value);
  };

  // Handle auto generation
  const handleGenerate = (e) => {
    e.preventDefault();
    const n = size;
    const totalCells = n * n;
    let arr = Array(totalCells)
      .fill()
      .map(
        () =>
          Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight
      );
    const newMatrix = [];
    for (let i = 0; i < n; i++) {
      newMatrix.push(arr.slice(i * n, (i + 1) * n));
    }
    setMatrix(newMatrix);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const greedyRes = greedyPlacement(matrix);
      const stochasticRes = stochasticPlacement(matrix, iterations);
      setResults({ greedy: greedyRes, stochastic: stochasticRes });
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  // Edit button: switch to manual mode
  const handleEdit = () => setInputMode("manual");

  // Render result table
  const renderResultTable = (result, label, type) => {
    if (!result || !result.placement) return null;
    return (
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">{label}</h3>
        <div className="overflow-x-auto">
          <table className="mx-auto border-collapse border border-gray-400 ">
            <tbody>
              {result.placement.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className="border border-gray-400 px-2 py-1 text-center">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {Array.isArray(result.corners) ? (
          <div className="mt-4">
            <h4 className="font-semibold mb-1">Кутові сили:</h4>
            <ul className="flex gap-4">
              {result.corners.map((force, idx) => (
                <li key={idx}>
                  Кут {idx + 1}:{" "}
                  <span className="font-mono">{force.toFixed(3)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-red-500">{result.corners}</p>
        )}
        {"cf" in result && (
          <div className="mt-2">
            <h4 className="font-semibold mb-1">Цільова функція:</h4>
            <span className="font-mono">{result.cf.toFixed(3)}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => handleExportResult(type)}
          className="mt-4 bg-gray-700 hover:bg-gray-900 text-white font-semibold py-1 px-4 rounded transition">
          Експортувати результат
        </button>
      </div>
    );
  };

  return (
    <main className="flex items-center justify-center py-[100px]">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl space-y-6">
        {/* Save/Load/Edit buttons */}
        <div className="flex gap-3 mb-4 sm:flex-row flex-col">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            title="Зберегти задачу">
            <span role="img" aria-label="save">
              ⬇️
            </span>
            Зберегти задачу
          </button>
          <label
            className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded cursor-pointer"
            title="Завантажити задачу">
            <span role="img" aria-label="load">
              ⬆️
            </span>
            Завантажити задачу
            <input
              type="file"
              accept="application/json"
              onChange={handleLoad}
              style={{ display: "none" }}
            />
          </label>
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            title="Редагувати">
            <span role="img" aria-label="edit">
              ✏️
            </span>
            Редагувати
          </button>
        </div>

        <div className="mb-4">
          <label className="mr-4 font-medium text-gray-700">
            <input
              type="radio"
              value="manual"
              checked={inputMode === "manual"}
              onChange={handleInputModeChange}
              className="mr-2"
            />
            Ручний ввід
          </label>
          <label className="font-medium text-gray-700">
            <input
              type="radio"
              value="auto"
              checked={inputMode === "auto"}
              onChange={handleInputModeChange}
              className="mr-2"
            />
            Генерація випадкових даних
          </label>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Розмір матриці (n × n):
            <input
              type="number"
              min="1"
              value={size}
              onChange={handleSizeChange}
              className="ml-3 border border-gray-300 rounded px-3 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
        </div>

        {inputMode === "manual" ? (
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse">
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    {row.map((val, j) => (
                      <td key={j} className="p-1">
                        <input
                          type="number"
                          min="1"
                          value={val}
                          onChange={(e) =>
                            handleMatrixChange(i, j, e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 w-16 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                          required
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Діапазон ваг:
                <input
                  type="number"
                  min="1"
                  value={minWeight}
                  onChange={(e) => setMinWeight(Number(e.target.value))}
                  className="ml-3 border border-gray-300 rounded px-2 py-1 w-16"
                  placeholder="min"
                />
                <span className="mx-2">-</span>
                <input
                  type="number"
                  min={minWeight}
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 w-16"
                  placeholder="max"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded transition">
              Згенерувати
            </button>
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse">
                <tbody>
                  {matrix.map((row, i) => (
                    <tr key={i}>
                      {row.map((val, j) => (
                        <td key={j} className="p-1">
                          <input
                            type="number"
                            value={val}
                            readOnly
                            className="border border-gray-300 rounded px-2 py-1 w-16 text-center bg-gray-100"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Кількість ітерацій для SA:
            <input
              type="number"
              min="1"
              value={iterations}
              onChange={handleIterationsChange}
              className="ml-3 border border-gray-300 rounded px-3 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">
            Розв’язати
          </button>
        </div>
        {/* Results */}
        {renderResultTable(results.greedy, "Результат (GA)", "greedy")}
        {renderResultTable(results.stochastic, "Результат (SA)", "stochastic")}
      </form>
    </main>
  );
};

export default Home;
