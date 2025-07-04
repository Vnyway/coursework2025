# Web Application for Research on Optimal Cargo Placement Algorithms

## App Access

Access the app at: [https://bright-douhua-5e4b1d.netlify.app/](https://bright-douhua-5e4b1d.netlify.app/)

---

## Description

This web application provides a complete set of tools for solving the optimal cargo placement problem on a platform. It allows users to input or generate problem data, solve it using greedy and stochastic algorithms, and conduct experimental research to analyze algorithm efficiency.

---

## Core Features

### Individual Problem Mode

- Manual input of the weight matrix
- Random problem generation with configurable parameters
- Matrix editing support
- Saving/loading tasks (JSON format only)
- Solving using:
  - **Greedy Algorithm (GA)**
  - **Stochastic Algorithm (SA)** with iteration parameter `t`
- Output includes:
  - Placement matrix
  - Corner force values
  - Objective function value
- Export of results (**JSON only**)

### Experimental Research

- Configurable parameters:
  - Problem size range
  - Number of experiments per data point
  - Weight range
  - Iteration parameter `t`
- Experiment types:
  - Finding optimal `t` for SA
  - Impact of problem size and parameters on accuracy and runtime
  - Comparing GA and SA performance
- Output includes:
  - Tables and charts (via Recharts)
  - Export results as JSON

---

## Input and Output Data

### Input:

- Weight matrix `n × n`
- Problem size `n`
- Iteration count `t`
- Minimum and maximum weights for generation

### Output:

- Placement matrix (GA & SA)
- Corner forces (4 values)
- Objective function value

---

## Tech Stack

- **React** – frontend framework for SPA development
- **Tailwind CSS** – responsive design
- **React Router DOM** – page routing
- **Recharts** – data visualization for experiments
- **Netlify** – hosting and CI/CD

---

## App Structure

### Main Pages:

- **Individual Task** – input/edit/generate/solve problems
- **Experiments** – configure and run batch experiments

### Key Components:

- `MatrixInput` – matrix entry interface
- `Solver` – logic for GA and SA algorithms
- `ExperimentPanel` – manage experiment configurations
- `Charts` – render experimental results

---

## User Guide

1. **Go to the homepage**
2. **Choose how to input data**:
   - Manually (enter `n` and weights)
   - Generate (specify `n` and weight range)
3. **Set iteration parameter `t` for SA**
4. **Click "Solve"** – view results for both GA and SA
5. **Save the task or result as JSON**
6. **Go to “Experiments”** to:
   - Set parameters (size, t, experiments, step)
   - Choose one of the three experiment types
   - View results as charts and tables
   - Download results as CSV or JSON

---

## Local Installation

To run the app locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/Vnyway/coursework2025.git
   cd coursework2025
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. Open in browser::
   ```bash
   http://localhost:3000
   ```
