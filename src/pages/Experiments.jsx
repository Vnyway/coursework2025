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

const tValues = [100, 500, 1000, 5000, 10000];
const sizes = [3, 5, 7, 9, 11];
const weightRanges = [
  { min: 1, max: 5 },
  { min: 1, max: 10 },
  { min: 5, max: 20 },
];

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
      let data = [];
      // t
      tValues.forEach((t) => {
        const matrix = generateMatrix(n, 1, 10);
        const t0 = performance.now();
        const res = stochasticPlacement(matrix, t);
        const t1 = performance.now();
        data.push({ param: `t=${t}`, cf: res.cf, time: +(t1 - t0).toFixed(2) });
      });
      // n
      sizes.forEach((size) => {
        const matrix = generateMatrix(size, 1, 10);
        const t0 = performance.now();
        const res = stochasticPlacement(matrix, 1000);
        const t1 = performance.now();
        data.push({
          param: `n=${size}`,
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
        data.push({
          param: `w=[${min},${max}]`,
          cf: res.cf,
          time: +(t1 - t0).toFixed(2),
        });
      });
      setResultsParams(data);
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
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={runTExperiment}
          disabled={loading}>
          Запустити експеримент
        </button>
        {resultsT.length > 0 && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resultsT}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis
                  yAxisId="left"
                  label={{ value: "CF", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Час (мс)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cf"
                  stroke="#8884d8"
                  name="CF"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="time"
                  stroke="#82ca9d"
                  name="Час (мс)"
                />
              </LineChart>
            </ResponsiveContainer>
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
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={runParamsExperiment}
          disabled={loading}>
          Запустити експеримент
        </button>
        {resultsParams.length > 0 && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resultsParams}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="param" />
                <YAxis
                  yAxisId="left"
                  label={{ value: "CF", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Час (мс)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cf"
                  stroke="#8884d8"
                  name="CF"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="time"
                  stroke="#82ca9d"
                  name="Час (мс)"
                />
              </LineChart>
            </ResponsiveContainer>
            <table className="mt-4 w-full text-sm border">
              <thead>
                <tr>
                  <th className="border px-2">Параметр</th>
                  <th className="border px-2">CF</th>
                  <th className="border px-2">Час (мс)</th>
                </tr>
              </thead>
              <tbody>
                {resultsParams.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2">{r.param}</td>
                    <td className="border px-2">{r.cf}</td>
                    <td className="border px-2">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3.4.3 */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">
          3.4.3 Вплив розмірності задачі на точність та час роботи алгоритмів
        </h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={runSizeExperiment}
          disabled={loading}>
          Запустити експеримент
        </button>
        {resultsSize.length > 0 && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resultsSize}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="n" />
                <YAxis
                  yAxisId="left"
                  label={{ value: "CF", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Час (мс)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="greedy_cf"
                  stroke="#8884d8"
                  name="Greedy CF"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="stochastic_cf"
                  stroke="#ff7300"
                  name="Stochastic CF"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="greedy_time"
                  stroke="#82ca9d"
                  name="Greedy Час"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="stochastic_time"
                  stroke="#0088FE"
                  name="Stochastic Час"
                />
              </LineChart>
            </ResponsiveContainer>
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
        )}
      </section>
    </div>
  );
};

export default Experiments;
