import React, { useState } from "react";
import { stochasticPlacement, greedyPlacement } from "../functions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Генерує n x n матрицю з випадковими вагами у діапазоні [minW, maxW]
const generateMatrix = (n, minW = 1, maxW = 10) => {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () =>
      Math.random() < 0.5
        ? 0
        : Math.floor(Math.random() * (maxW - minW + 1)) + minW
    )
  );
};

function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const replacer = (key, value) => (value === null ? "" : value);
  const header = Object.keys(data[0]);
  const csv =
    header.join(",") +
    "\n" +
    data
      .map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      )
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const Experiments = () => {
  // Параметри для експериментів
  const [tRange, setTRange] = useState({ from: 100, to: 1000, step: 100 });
  const [nRange, setNRange] = useState({ from: 3, to: 10, step: 1 });
  const [wRange, setWRange] = useState({ min: 1, max: 10 });
  const [numInstances, setNumInstances] = useState(5);

  const [resultsT, setResultsT] = useState([]);
  const [resultsParams, setResultsParams] = useState([]);
  const [resultsSize, setResultsSize] = useState([]);
  const [loading, setLoading] = useState(false);

  // Генерація масиву значень за діапазоном
  const range = (from, to, step) => {
    const arr = [];
    for (let v = from; v <= to; v += step) arr.push(v);
    return arr;
  };

  // 3.4.1: t experiment
  const runTExperiment = () => {
    setLoading(true);
    setTimeout(() => {
      const n = 7;
      const tValues = range(tRange.from, tRange.to, tRange.step);
      let data = [];
      tValues.forEach((t) => {
        let cfSum = 0,
          timeSum = 0;
        for (let i = 0; i < numInstances; ++i) {
          const matrix = generateMatrix(n, wRange.min, wRange.max);
          const t0 = performance.now();
          const res = stochasticPlacement(matrix, t);
          const t1 = performance.now();
          cfSum += res.cf;
          timeSum += t1 - t0;
        }
        data.push({
          t,
          cf: +(cfSum / numInstances).toFixed(2),
          time: +(timeSum / numInstances).toFixed(2),
        });
      });
      setResultsT(data);
      setLoading(false);
    }, 100);
  };

  // 3.4.2: параметри стохастичного алгоритму (без t)
  const runParamsExperiment = () => {
    setLoading(true);
    setTimeout(() => {
      const nValues = range(nRange.from, nRange.to, nRange.step);
      // n
      let nData = [];
      nValues.forEach((n) => {
        let cfSum = 0,
          timeSum = 0;
        for (let i = 0; i < numInstances; ++i) {
          const matrix = generateMatrix(n, wRange.min, wRange.max);
          const t0 = performance.now();
          const res = stochasticPlacement(matrix, 1000);
          const t1 = performance.now();
          cfSum += res.cf;
          timeSum += t1 - t0;
        }
        nData.push({
          n,
          cf: +(cfSum / numInstances).toFixed(2),
          time: +(timeSum / numInstances).toFixed(2),
        });
      });
      // w
      let wData = [];
      for (let minW = wRange.min; minW <= wRange.max; minW += 1) {
        let maxW = Math.min(wRange.max, minW + 2);
        let cfSum = 0,
          timeSum = 0;
        for (let i = 0; i < numInstances; ++i) {
          const matrix = generateMatrix(7, minW, maxW);
          const t0 = performance.now();
          const res = stochasticPlacement(matrix, 1000);
          const t1 = performance.now();
          cfSum += res.cf;
          timeSum += t1 - t0;
        }
        wData.push({
          w: `[${minW},${maxW}]`,
          cf: +(cfSum / numInstances).toFixed(2),
          time: +(timeSum / numInstances).toFixed(2),
        });
      }
      setResultsParams({ nData, wData });
      setLoading(false);
    }, 100);
  };

  // 3.4.3: розмірність задачі
  const runSizeExperiment = () => {
    setLoading(true);
    setTimeout(() => {
      const nValues = range(nRange.from, nRange.to, nRange.step);
      const t = 1000;
      let data = [];
      nValues.forEach((n) => {
        let greedy_cf = 0,
          greedy_time = 0,
          stochastic_cf = 0,
          stochastic_time = 0;
        for (let i = 0; i < numInstances; ++i) {
          const matrix = generateMatrix(n, wRange.min, wRange.max);
          // Greedy
          const t0 = performance.now();
          const greedy = greedyPlacement(matrix);
          const t1 = performance.now();
          // Stochastic
          const t2 = performance.now();
          const stochastic = stochasticPlacement(matrix, t);
          const t3 = performance.now();
          greedy_cf += greedy.cf;
          greedy_time += t1 - t0;
          stochastic_cf += stochastic.cf;
          stochastic_time += t3 - t2;
        }
        data.push({
          n,
          greedy_cf: +(greedy_cf / numInstances).toFixed(2),
          greedy_time: +(greedy_time / numInstances).toFixed(2),
          stochastic_cf: +(stochastic_cf / numInstances).toFixed(2),
          stochastic_time: +(stochastic_time / numInstances).toFixed(2),
        });
      });
      setResultsSize(data);
      setLoading(false);
    }, 100);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Експерименти з алгоритмами</h1>

      {/* Параметри експериментів */}
      <section className="bg-gray-50 rounded shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Параметри експериментів</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs">Розмірність задачі (n):</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                value={nRange.from}
                onChange={(e) =>
                  setNRange((r) => ({ ...r, from: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="від"
              />
              <span>-</span>
              <input
                type="number"
                min={nRange.from}
                value={nRange.to}
                onChange={(e) =>
                  setNRange((r) => ({ ...r, to: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="до"
              />
              <span>крок</span>
              <input
                type="number"
                min={1}
                value={nRange.step}
                onChange={(e) =>
                  setNRange((r) => ({ ...r, step: +e.target.value }))
                }
                className="border px-1 w-10"
                placeholder="крок"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs">Параметр t (ітерації):</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                value={tRange.from}
                onChange={(e) =>
                  setTRange((r) => ({ ...r, from: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="від"
              />
              <span>-</span>
              <input
                type="number"
                min={tRange.from}
                value={tRange.to}
                onChange={(e) =>
                  setTRange((r) => ({ ...r, to: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="до"
              />
              <span>крок</span>
              <input
                type="number"
                min={1}
                value={tRange.step}
                onChange={(e) =>
                  setTRange((r) => ({ ...r, step: +e.target.value }))
                }
                className="border px-1 w-10"
                placeholder="крок"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs">Діапазон ваг:</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                value={wRange.min}
                onChange={(e) =>
                  setWRange((r) => ({ ...r, min: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="min"
              />
              <span>-</span>
              <input
                type="number"
                min={wRange.min}
                value={wRange.max}
                onChange={(e) =>
                  setWRange((r) => ({ ...r, max: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="max"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs">Кількість ІЗ на точку:</label>
            <input
              type="number"
              min={1}
              value={numInstances}
              onChange={(e) => setNumInstances(+e.target.value)}
              className="border px-1 w-14"
              placeholder="Кількість"
            />
          </div>
        </div>
      </section>

      {/* 3.4.1 */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">
          3.4.1 Визначення параметра t для стохастичного алгоритму
        </h2>
        <div className="flex gap-2 mb-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={runTExperiment}
            disabled={loading}>
            Запустити експеримент
          </button>
          {resultsT.length > 0 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => exportToCSV(resultsT, "t_experiment.csv")}>
              Завантажити результати
            </button>
          )}
        </div>
        {resultsT.length > 0 && (
          <div className="mt-4 space-y-8">
            <div>
              <h3 className="font-semibold mb-2">Залежність CF від t</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={resultsT}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis
                    label={{ value: "CF", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cf"
                    stroke="#8884d8"
                    name="CF"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Залежність часу від t</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={resultsT}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis
                    label={{
                      value: "Час (мс)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#82ca9d"
                    name="Час (мс)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="mt-4 w-full text-sm border">
              <thead>
                <tr>
                  <th className="border px-2">t</th>
                  <th className="border px-2">CF</th>
                  <th className="border px-2">Час (мс)</th>
                </tr>
              </thead>
              <tbody>
                {resultsT.map((r) => (
                  <tr key={r.t}>
                    <td className="border px-2">{r.t}</td>
                    <td className="border px-2">{r.cf}</td>
                    <td className="border px-2">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3.4.2 */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">
          3.4.2 Дослідження впливу параметрів стохастичного алгоритму
        </h2>
        <div className="flex gap-2 mb-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={runParamsExperiment}
            disabled={loading}>
            Запустити експеримент
          </button>
          {resultsParams.nData && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => {
                exportToCSV(resultsParams.nData, "params_n.csv");
                exportToCSV(resultsParams.wData, "params_w.csv");
              }}>
              Завантажити результати
            </button>
          )}
        </div>
        {resultsParams.nData && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">CF від n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.nData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{ value: "CF", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cf"
                    stroke="#8884d8"
                    name="CF"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Час від n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.nData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{
                      value: "Час (мс)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#82ca9d"
                    name="Час (мс)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">CF від w</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.wData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="w" />
                  <YAxis
                    label={{ value: "CF", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cf"
                    stroke="#8884d8"
                    name="CF"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Час від w</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.wData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="w" />
                  <YAxis
                    label={{
                      value: "Час (мс)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#82ca9d"
                    name="Час (мс)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* 3.4.3 */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">
          3.4.3 Вплив розмірності задачі на точність та час роботи алгоритмів
        </h2>
        <div className="flex gap-2 mb-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={runSizeExperiment}
            disabled={loading}>
            Запустити експеримент
          </button>
          {resultsSize.length > 0 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => exportToCSV(resultsSize, "size_experiment.csv")}>
              Завантажити результати
            </button>
          )}
        </div>
        {resultsSize.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Greedy: CF від n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsSize}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{ value: "CF", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="greedy_cf"
                    stroke="#8884d8"
                    name="Greedy CF"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stochastic: CF від n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsSize}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{ value: "CF", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stochastic_cf"
                    stroke="#ff7300"
                    name="Stochastic CF"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Greedy: Час від n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsSize}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{
                      value: "Час (мс)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="greedy_time"
                    stroke="#82ca9d"
                    name="Greedy Час"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stochastic: Час від n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsSize}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{
                      value: "Час (мс)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stochastic_time"
                    stroke="#0088FE"
                    name="Stochastic Час"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-2">
              <table className="mt-4 w-full text-sm border">
                <thead>
                  <tr>
                    <th className="border px-2">n</th>
                    <th className="border px-2">Greedy CF</th>
                    <th className="border px-2">Greedy Час (мс)</th>
                    <th className="border px-2">Stochastic CF</th>
                    <th className="border px-2">Stochastic Час (мс)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsSize.map((r) => (
                    <tr key={r.n}>
                      <td className="border px-2">{r.n}</td>
                      <td className="border px-2">{r.greedy_cf}</td>
                      <td className="border px-2">{r.greedy_time}</td>
                      <td className="border px-2">{r.stochastic_cf}</td>
                      <td className="border px-2">{r.stochastic_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Experiments;
