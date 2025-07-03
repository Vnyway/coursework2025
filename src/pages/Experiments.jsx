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

// Generates an n x n matrix with random weights in the range [minW, maxW]
const generateMatrix = (n, minW = 1, maxW = 10) => {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () =>
      Math.random() < 0.5
        ? 0
        : Math.floor(Math.random() * (maxW - minW + 1)) + minW
    )
  );
};

// Save data as JSON
function exportToJSON(data, filename) {
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const Experiments = () => {
  // Experiment parameters
  const [tRange, setTRange] = useState({ from: 100, to: 1000, step: 100 });
  const [nRange, setNRange] = useState({ from: 3, to: 10, step: 1 });
  const [wRange, setWRange] = useState({ min: 1, max: 10 });
  const [numInstances, setNumInstances] = useState(5);

  const [resultsT, setResultsT] = useState([]);
  const [resultsParams, setResultsParams] = useState([]);
  const [resultsSize, setResultsSize] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate an array of values by range
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

  // 3.4.2: stochastic algorithm parameters (without t)
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

  // 3.4.3: problem size
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
          greedy: {
            cf: +(greedy_cf / numInstances).toFixed(2),
            time: +(greedy_time / numInstances).toFixed(2),
          },
          stochastic: {
            cf: +(stochastic_cf / numInstances).toFixed(2),
            time: +(stochastic_time / numInstances).toFixed(2),
          },
        });
      });
      setResultsSize(data);
      setLoading(false);
    }, 100);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Algorithm Experiments</h1>

      {/* Experiment parameters */}
      <section className="bg-gray-50 rounded shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Experiment Parameters</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs">Problem size (n):</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                value={nRange.from}
                onChange={(e) =>
                  setNRange((r) => ({ ...r, from: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="from"
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
                placeholder="to"
              />
              <span>step</span>
              <input
                type="number"
                min={1}
                value={nRange.step}
                onChange={(e) =>
                  setNRange((r) => ({ ...r, step: +e.target.value }))
                }
                className="border px-1 w-10"
                placeholder="step"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs">Parameter t (iterations):</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                value={tRange.from}
                onChange={(e) =>
                  setTRange((r) => ({ ...r, from: +e.target.value }))
                }
                className="border px-1 w-14"
                placeholder="from"
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
                placeholder="to"
              />
              <span>step</span>
              <input
                type="number"
                min={1}
                value={tRange.step}
                onChange={(e) =>
                  setTRange((r) => ({ ...r, step: +e.target.value }))
                }
                className="border px-1 w-10"
                placeholder="step"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs">Weight range:</label>
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
            <label className="block text-xs">
              Number of instances per point:
            </label>
            <input
              type="number"
              min={1}
              value={numInstances}
              onChange={(e) => setNumInstances(+e.target.value)}
              className="border px-1 w-14"
              placeholder="Count"
            />
          </div>
        </div>
      </section>

      {/* 3.4.1 */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">
          Determining parameter t for the stochastic algorithm
        </h2>
        <div className="flex gap-2 mb-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={runTExperiment}
            disabled={loading}>
            Run experiment
          </button>
          {resultsT.length > 0 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => exportToJSON(resultsT, "t_experiment.json")}>
              Download results (JSON)
            </button>
          )}
        </div>
        {resultsT.length > 0 && (
          <div className="mt-4 space-y-8">
            <div>
              <h3 className="font-semibold mb-2">CF vs t</h3>
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
              <h3 className="font-semibold mb-2">Time vs t</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={resultsT}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis
                    label={{
                      value: "Time (ms)",
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
                    name="Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="mt-4 w-full text-sm border">
              <thead>
                <tr>
                  <th className="border px-2">t</th>
                  <th className="border px-2">CF</th>
                  <th className="border px-2">Time (ms)</th>
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
          Study of the influence of stochastic algorithm parameters
        </h2>
        <div className="flex gap-2 mb-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={runParamsExperiment}
            disabled={loading}>
            Run experiment
          </button>
          {resultsParams.nData && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => {
                exportToJSON(resultsParams.nData, "params_n.json");
                exportToJSON(resultsParams.wData, "params_w.json");
              }}>
              Download results (JSON)
            </button>
          )}
        </div>
        {resultsParams.nData && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">CF vs n</h3>
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
              <h3 className="font-semibold mb-2">Time vs n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.nData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{
                      value: "Time (ms)",
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
                    name="Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">CF vs w</h3>
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
              <h3 className="font-semibold mb-2">Time vs w</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={resultsParams.wData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="w" />
                  <YAxis
                    label={{
                      value: "Time (ms)",
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
                    name="Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Tables for nData and wData */}
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Results table (n)</h3>
              <table className="mt-2 w-full text-sm border">
                <thead>
                  <tr>
                    <th className="border px-2">n</th>
                    <th className="border px-2">CF</th>
                    <th className="border px-2">Time (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsParams.nData.map((r) => (
                    <tr key={r.n}>
                      <td className="border px-2">{r.n}</td>
                      <td className="border px-2">{r.cf}</td>
                      <td className="border px-2">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Results table (w)</h3>
              <table className="mt-2 w-full text-sm border">
                <thead>
                  <tr>
                    <th className="border px-2">w</th>
                    <th className="border px-2">CF</th>
                    <th className="border px-2">Time (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsParams.wData.map((r, i) => (
                    <tr key={r.w + i}>
                      <td className="border px-2">{r.w}</td>
                      <td className="border px-2">{r.cf}</td>
                      <td className="border px-2">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 3.4.3 */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">
          Influence of problem size on the accuracy and runtime of algorithms
        </h2>
        <div className="flex gap-2 mb-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={runSizeExperiment}
            disabled={loading}>
            Run experiment
          </button>
          {resultsSize.length > 0 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => exportToJSON(resultsSize, "size_experiment.json")}>
              Download results (JSON)
            </button>
          )}
        </div>
        {resultsSize.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Greedy: CF vs n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={resultsSize.map((r) => ({ n: r.n, cf: r.greedy.cf }))}>
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
                    name="Greedy CF"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stochastic: CF vs n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={resultsSize.map((r) => ({
                    n: r.n,
                    cf: r.stochastic.cf,
                  }))}>
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
                    stroke="#ff7300"
                    name="Stochastic CF"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Greedy: Time vs n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={resultsSize.map((r) => ({
                    n: r.n,
                    time: r.greedy.time,
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{
                      value: "Time (ms)",
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
                    name="Greedy Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stochastic: Time vs n</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={resultsSize.map((r) => ({
                    n: r.n,
                    time: r.stochastic.time,
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis
                    label={{
                      value: "Time (ms)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#0088FE"
                    name="Stochastic Time"
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
                    <th className="border px-2">Greedy Time (ms)</th>
                    <th className="border px-2">Stochastic CF</th>
                    <th className="border px-2">Stochastic Time (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsSize.map((r) => (
                    <tr key={r.n}>
                      <td className="border px-2">{r.n}</td>
                      <td className="border px-2">{r.greedy.cf}</td>
                      <td className="border px-2">{r.greedy.time}</td>
                      <td className="border px-2">{r.stochastic.cf}</td>
                      <td className="border px-2">{r.stochastic.time}</td>
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
