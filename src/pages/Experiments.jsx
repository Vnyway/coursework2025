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

const generateMatrix = (n, minW = 1, maxW = 10) => {
  // Генерує n x n матрицю з випадковими вагами у діапазоні [minW, maxW]
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () =>
      Math.random() < 0.5
        ? 0
        : Math.floor(Math.random() * (maxW - minW + 1)) + minW
    )
  );
};

// Втричі більше значень t
const tValues = [
  100, 250, 400, 500, 650, 800, 1000, 2500, 4000, 5000, 6500, 8000, 10000,
  13000, 16000,
];

// Втричі більше значень розмірів
const sizes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// Втричі більше діапазонів ваг
const weightRanges = [
  { min: 1, max: 2 },
  { min: 1, max: 3 },
  { min: 1, max: 4 },
  { min: 1, max: 5 },
  { min: 1, max: 7 },
  { min: 1, max: 10 },
  { min: 3, max: 12 },
  { min: 5, max: 15 },
  { min: 5, max: 20 },
];

// Допоміжна функція для експорту даних у CSV
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
  const [resultsT, setResultsT] = useState([]);
  const [resultsParams, setResultsParams] = useState([]);
  const [resultsSize, setResultsSize] = useState([]);
  const [loading, setLoading] = useState(false);

  // 3.4.1
  const runTExperiment = () => {
    setLoading(true);
    setTimeout(() => {
      const n = 7;
      const matrix = generateMatrix(n, 1, 10);
      const data = tValues.map((t) => {
        const t0 = performance.now();
        const res = stochasticPlacement(matrix, t);
        const t1 = performance.now();
        return {
          t,
          cf: res.cf,
          time: +(t1 - t0).toFixed(2),
        };
      });
      setResultsT(data);
      setLoading(false);
    }, 100);
  };

  // 3.4.2
  const runParamsExperiment = () => {
    setLoading(true);
    setTimeout(() => {
      const n = 7;
      let tData = [];
      let nData = [];
      let wData = [];
      // t
      tValues.forEach((t) => {
        const matrix = generateMatrix(n, 1, 10);
        const t0 = performance.now();
        const res = stochasticPlacement(matrix, t);
        const t1 = performance.now();
        tData.push({ t, cf: res.cf, time: +(t1 - t0).toFixed(2) });
      });
      // n
      sizes.forEach((size) => {
        const matrix = generateMatrix(size, 1, 10);
        const t0 = performance.now();
        const res = stochasticPlacement(matrix, 1000);
        const t1 = performance.now();
        nData.push({
          n: size,
          cf: res.cf,
          time: +(t1 - t0).toFixed(2),
        });
      });
      // weight range
      weightRanges.forEach(({ min, max }) => {
        const matrix = generateMatrix(n, min, max);
        const t0 = performance.now();
        const res = stochasticPlacement(matrix, 1000);
        const t1 = performance.now();
        wData.push({
          w: `[${min},${max}]`,
          cf: res.cf,
          time: +(t1 - t0).toFixed(2),
        });
      });
      setResultsParams({ tData, nData, wData });
      setLoading(false);
    }, 100);
  };

  // 3.4.3
  const runSizeExperiment = () => {
    setLoading(true);
    setTimeout(() => {
      const t = 1000;
      const data = sizes.map((n) => {
        const matrix = generateMatrix(n, 1, 10);
        // Greedy
        const t0 = performance.now();
        const greedy = greedyPlacement(matrix);
        const t1 = performance.now();
        // Stochastic
        const t2 = performance.now();
        const stochastic = stochasticPlacement(matrix, t);
        const t3 = performance.now();
        return {
          n,
          greedy_cf: greedy.cf,
          greedy_time: +(t1 - t0).toFixed(2),
          stochastic_cf: stochastic.cf,
          stochastic_time: +(t3 - t2).toFixed(2),
        };
      });
      setResultsSize(data);
      setLoading(false);
    }, 100);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Експерименти з алгоритмами</h1>

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
            {/* Графік 1: CF від T */}
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
            {/* Графік 2: Час від T */}
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
          {resultsParams.tData && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => {
                exportToCSV(resultsParams.tData, "params_t.csv");
                exportToCSV(resultsParams.nData, "params_n.csv");
                exportToCSV(resultsParams.wData, "params_w.csv");
              }}>
              Завантажити результати
            </button>
          )}
        </div>
        {resultsParams.tData && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* t-графіки */}
            <div>
              <h3 className="font-semibold mb-2">CF від t</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.tData}>
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
              <h3 className="font-semibold mb-2">Час від t</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.tData}>
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
            {/* n-графіки */}
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
            {/* w-графіки */}
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
            {/* Графік 1: CF Greedy */}
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
            {/* Графік 2: CF Stochastic */}
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
            {/* Графік 3: Час Greedy */}
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
            {/* Графік 4: Час Stochastic */}
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
