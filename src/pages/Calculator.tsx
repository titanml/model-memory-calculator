import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../context/themeContext';

import MODELS from '../utils/models';
import DEVICES from '../utils/devices';

type Precision = '32-bit' | '16-bit' | '8-bit' | '4-bit';

interface ModelSizeBarChartProps {
  modelSize: number; // in GB
  largestModelSize: number; // largest model in full precision (32-bit)
  modelPrecision: Precision;
  deviceMemorySet: boolean;
  activationMemorySize?: number;
}

interface InferenceRuntimeLineChartProps {
  availableMemory: AvailableMemory; // in GB
  memoryPerInput: number; // in GB
}

interface LineChartData {
  seqLength: number;
  batchSize: number;
}

interface AvailableMemory {
  '4-bit': number;
  '8-bit': number;
  '16-bit': number;
  '32-bit': number;
}

// Utility to determine color based on precision
function chooseColor(precision: Precision) {
  const colors = {
    '32-bit': '#e45f5b',
    '16-bit': '#ffc068',
    '8-bit': '#71cce9',
    '4-bit': '#383d95',
  };
  return colors[precision] || 'gray';
}

// Calculate standard memory (model size based on precision only)
function calculateStandardMemory(modelParams: number, precision: Precision): number {
  const precisionFactor = {
    '32-bit': 4,
    '16-bit': 2,
    '8-bit': 1,
    '4-bit': 0.5,
  };

  const memory = modelParams * precisionFactor[precision]; // GB
  console.log(`[Standard] ${precision.toUpperCase()} Memory:`, memory);
  return memory;
}

// Calculate prefill chunking memory (model size + activation + input memory)
function calculatePrefillMemory(
  modelParams: number,
  hiddenSize: number,
  numLayers: number,
  intermediateSize: number,
  precision: Precision
): number {
  const precisionFactor = {
    '32-bit': 4,
    '16-bit': 2,
    '8-bit': 1,
    '4-bit': 0.5,
  };

  // Max Chunk Size - adjustable in the future
  const maxChunkSize = 512;

  // Calculate each memory component
  const modelMemorySize = modelParams * precisionFactor[precision]; // GB
  const activationMemorySize = (maxChunkSize * 2 * Math.max(2 * intermediateSize, 4 * hiddenSize)) / 1_000_000_000; // GB
  const memoryPerInput = (4 * hiddenSize * numLayers) / 1_000_000_000; // GB

  // Combine all components
  const totalMemory = modelMemorySize + activationMemorySize + memoryPerInput;

  console.log(`[Prefill] ${precision.toUpperCase()} Memory:`, totalMemory);
  console.log(`[Prefill] Activation Memory:`, activationMemorySize);
  console.log(`[Prefill] Memory Per Input:`, memoryPerInput);

  return totalMemory;
}

// Bar chart for model footprint (shared by both standard and prefill chunking calculators)
function ModelSizeBarChart({
  modelSize,
  largestModelSize,
  modelPrecision,
  deviceMemorySet,
  activationMemorySize = 0,
}: ModelSizeBarChartProps) {
  const { theme } = useTheme();
  const chartRef = useRef<SVGSVGElement>(null);

  const width = 600;
  const height = 50;

  useEffect(() => {
    if (modelSize > 0 && largestModelSize > 0) {
      d3.select(chartRef.current).selectAll('*').remove();

      const svg = d3.select(chartRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('animation', 'fadeIn 0.3s ease-in-out') // Inline animation
        .style('transition', 'transform 0.3s ease-in-out') // Hover effect
        .on('mouseover', function () {
          d3.select(this).style('transform', 'scale(1.02)');
        })
        .on('mouseout', function () {
          d3.select(this).style('transform', 'scale(1)');
        });

      const xScale = d3.scaleLinear().domain([0, largestModelSize]).range([0, width]);

      if (modelSize + activationMemorySize > largestModelSize) {
        svg
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'transparent')
          .style('stroke', theme === 'dark' ? '#f9fafb' : '#181f26')
          .style('stroke-dasharray', '4, 4')
          .style('stroke-width', '2px');
        svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('fill', theme === 'dark' ? '#f9fafb' : '#181f26')
          .text('Out of Memory');
      } else {
        svg
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', xScale(modelSize))
          .attr('height', height)
          .attr('fill', chooseColor(modelPrecision));

        if (activationMemorySize > 0) {
          svg
            .append('rect')
            .attr('x', xScale(modelSize))
            .attr('y', 0)
            .attr('width', xScale(activationMemorySize))
            .attr('height', height)
            .attr('fill', '#a4b8e0');
        }

        if (deviceMemorySet) {
          svg
            .append('rect')
            .attr('x', xScale(modelSize + activationMemorySize))
            .attr('y', 0)
            .attr('width', xScale(largestModelSize - (modelSize + activationMemorySize)))
            .attr('height', height)
            .attr('fill', 'transparent')
            .style('stroke', chooseColor(modelPrecision))
            .style('stroke-width', '2px');
        }
      }
    }
  }, [modelSize, largestModelSize, modelPrecision, deviceMemorySet, activationMemorySize, theme]);

  return <svg ref={chartRef}></svg>;
}

// Line chart for inference runtime (shared by both standard and prefill chunking calculators)
function InferenceRuntimeLineChart({ availableMemory, memoryPerInput }: InferenceRuntimeLineChartProps) {
  const { theme } = useTheme();
  const chartRef = useRef(null);
  const tooltipRef = useRef<HTMLDivElement>(null); // Ref for the tooltip
  const maxSeqLength = 4096;
  const maxBatchSize = 128;

  useEffect(() => {
    if (memoryPerInput > 0 && Object.values(availableMemory).some((val) => val > 0)) {
      const margin = { top: 20, right: 20, bottom: 50, left: 50 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select(chartRef.current);
      svg.selectAll('*').remove();

      const xScale = d3.scaleLinear().domain([0, maxSeqLength]).range([0, width]);
      const yScale = d3.scaleLinear().domain([0, maxBatchSize]).range([height, 0]);

      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      const zoom = d3.zoom()
        .scaleExtent([0.5, 10])
        .translateExtent([[-width, -height], [2 * width, 2 * height]])
        .on('zoom', (event) => {
          const transform = event.transform;
          svg.select('.x-axis').call(xAxis.scale(transform.rescaleX(xScale)));
          svg.select('.y-axis').call(yAxis.scale(transform.rescaleY(yScale)));
          svg.selectAll('path').attr('transform', transform);
        });

      svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(zoom);

      svg.append('g').attr('class', 'x-axis').attr('transform', `translate(${margin.left}, ${height + margin.top})`).call(xAxis);

      svg.append('g').attr('class', 'y-axis').attr('transform', `translate(${margin.left}, ${margin.top})`).call(yAxis);

      svg.append('text')
        .attr('transform', `translate(${width / 2 + margin.left}, ${height + margin.top + 40})`)
        .style('text-anchor', 'middle')
        .attr('fill', theme === 'dark' ? '#f9fafb' : '#181f26')
        .text('Sequence Length');

      svg.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('y', 0)
        .attr('x', 0 - height / 2 - margin.top)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .attr('fill', theme === 'dark' ? '#f9fafb' : '#181f26')
        .text('Batch Size');

      // Adding legend for precisions
      const precisions = [
        { name: '32-bit', color: '#e45f5b' },
        { name: '16-bit', color: '#ffc068' },
        { name: '8-bit', color: '#71cce9' },
        { name: '4-bit', color: '#383d95' },
      ];

      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 20}, 20)`);

      precisions.forEach((precision, index) => {
        const legendItem = legend.append('g').attr('transform', `translate(0, ${index * 30})`);

        legendItem.append('rect')
          .attr('x', 10)
          .attr('y', 10)
          .attr('width', 10)
          .attr('height', 10)
          .style('fill', precision.color);

        legendItem.append('text')
          .attr('x', 30)
          .attr('y', 16)
          .text(precision.name)
          .style('font-size', '16px')
          .style('fill', theme === 'dark' ? '#f9fafb' : '#181f26')
          .attr('alignment-baseline', 'middle');
      });

      legend.append('rect')
        .attr('class', 'legend-box')
        .attr('width', 80)
        .attr('height', precisions.length * 30)
        .style('fill', 'none')
        .style('stroke-width', '1px')
        .style('stroke', theme === 'dark' ? '#f9fafb' : '#181f26');

      const tooltip = d3.select(tooltipRef.current)
        .style('position', 'absolute')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('transition', 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out')
        .style('background-color', 'rgba(0, 0, 0, 0.75)')
        .style('color', 'white')
        .style('font-size', '14px');

      for (const [precision, memory] of Object.entries(availableMemory)) {
        const sequenceLengths = d3.range(1, maxSeqLength, 1)
          .map((seqLength) => ({
            seqLength,
            batchSize: memory / (seqLength * memoryPerInput),
          }))
          .filter((d) => d.batchSize <= maxBatchSize && d.batchSize > 1 && d.seqLength > 1);

        const lineGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

        const line = d3.line<LineChartData>()
          .x((d) => xScale(d.seqLength))
          .y((d) => yScale(d.batchSize))
          .curve(d3.curveBasis);

        lineGroup.append('path')
          .datum(sequenceLengths)
          .attr('fill', 'none')
          .attr('stroke', chooseColor(precision as Precision))
          .attr('stroke-width', 4)
          .attr('d', line)
          .on('mouseover', () => {
            tooltip.style('opacity', 1)
              .style('transform', 'translateY(-10px)');
          })
          .on('mousemove', (event) => {
            tooltip.selectAll('text').remove();
            const [x, y] = d3.pointer(event);
            const xValue = xScale.invert(x);
            const yValue = yScale.invert(y);
            tooltip.html(`Sequence Length: ${xValue.toFixed(0)}<br/>Batch Size: ${yValue.toFixed(0)}`)
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY + 10 + 'px');
          })
          .on('mouseout', () => {
            tooltip.style('opacity', 0);
          });
      }
    }
  }, [availableMemory, memoryPerInput, theme]);

  return (
    <>
      <div id="tooltip" ref={tooltipRef}></div>
      <svg ref={chartRef} width={600} height={400} />
    </>
  );
}

// Prefill Chunking Calculator with Updated Logic and Precision Adjustment
function PrefillChunkingCalculator({
  deviceMemory,
  modelParams,
  hiddenSize,
  numLayers,
  intermediateSize,
}: {
  deviceMemory: number;
  modelParams: number;
  hiddenSize: number;
  numLayers: number;
  intermediateSize: number;
}) {
  if (!deviceMemory || !modelParams || !hiddenSize || !numLayers || !intermediateSize) {
    return null;
  }

  // Calculate activation memory size based on intermediate size and hidden size
  const activationMemorySize = (512 * 2 * (Math.max(2 * intermediateSize, 4 * hiddenSize))) / 1_000_000_000;

  return (
    <>
      {/* Model Footprint with Prefill Chunking */}
      <div className="chart">
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }} className="text-2xl text-center mb-4">Model Footprint with Prefill Chunking</div>
        <div className="space-y-8">
          {(['32-bit', '16-bit', '8-bit', '4-bit'] as Precision[]).map((precision) => {
            const totalMemory = calculatePrefillMemory(
              modelParams,
              hiddenSize,
              numLayers,
              intermediateSize,
              precision
            );
            return (
              <div key={precision} style={{ animation: 'fadeIn 0.3s ease-in-out' }} className="chart-row">
                <div className="chart-row-title">{precision.toUpperCase()}</div>
                <ModelSizeBarChart
                  modelSize={totalMemory}
                  largestModelSize={deviceMemory}
                  modelPrecision={precision}
                  deviceMemorySet={deviceMemory > 0}
                  activationMemorySize={activationMemorySize} // Updated to pass activation memory size
                />
                <div className="chart-row-size ml-8">
                  {totalMemory.toFixed(2)} / {deviceMemory} GB
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inference Runtime with Prefill Chunking */}
      <div className="chart">
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }} className="text-2xl text-center mb-4">
          Maximum Batch Size / Sequence Length with Prefill Chunking
        </div>
        <InferenceRuntimeLineChart
          availableMemory={{
            '4-bit': deviceMemory - calculatePrefillMemory(modelParams, hiddenSize, numLayers, intermediateSize, '4-bit'),
            '8-bit': deviceMemory - calculatePrefillMemory(modelParams, hiddenSize, numLayers, intermediateSize, '8-bit'),
            '16-bit': deviceMemory - calculatePrefillMemory(modelParams, hiddenSize, numLayers, intermediateSize, '16-bit'),
            '32-bit': deviceMemory - calculatePrefillMemory(modelParams, hiddenSize, numLayers, intermediateSize, '32-bit'),
          }}
          memoryPerInput={(4 * hiddenSize * numLayers) / 1_000_000_000}
        />
      </div>
    </>
  );
}

// Standard Model Memory Calculator (unchanged)
function StandardCalculator({
  deviceMemory,
  modelParams,
  hiddenSize,
  numLayers,
}: {
  deviceMemory: number;
  modelParams: number;
  hiddenSize: number;
  numLayers: number;
}) {
  if (!deviceMemory || !modelParams || !hiddenSize || !numLayers) {
    return null;
  }

  return (
    <>
      {/* Model Footprint */}
      <div className="chart mb-8">
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }} className="text-2xl text-center mb-4">Model Footprint</div>
        <div className="space-y-8">
          {(['32-bit', '16-bit', '8-bit', '4-bit'] as Precision[]).map((precision) => (
            <div key={precision} style={{ animation: 'fadeIn 0.3s ease-in-out' }} className="chart-row">
              <div className="chart-row-title">{precision.toUpperCase()}</div>
              <ModelSizeBarChart
                modelSize={calculateStandardMemory(modelParams, precision)}
                largestModelSize={deviceMemory}
                modelPrecision={precision}
                deviceMemorySet={deviceMemory > 0}
              />
              <div className="chart-row-size ml-8">
                {calculateStandardMemory(modelParams, precision).toFixed(2)} / {deviceMemory} GB
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maximum Batch Size / Sequence Length */}
      <div className="chart">
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }} className="text-2xl text-center mb-4">
          Maximum Batch Size / Sequence Length
        </div>
        <InferenceRuntimeLineChart
          availableMemory={{
            '4-bit': deviceMemory - calculateStandardMemory(modelParams, '4-bit'),
            '8-bit': deviceMemory - calculateStandardMemory(modelParams, '8-bit'),
            '16-bit': deviceMemory - calculateStandardMemory(modelParams, '16-bit'),
            '32-bit': deviceMemory - calculateStandardMemory(modelParams, '32-bit'),
          }}
          memoryPerInput={(4 * hiddenSize * numLayers) / 1_000_000_000}
        />
      </div>
    </>
  );
}

// Main Calculator Page
const Calculator = () => {
  const [modelParams, setModelParams] = useState<number | null>(null);
  const [hiddenSize, setHiddenSize] = useState<number | null>(null);
  const [numLayers, setNumLayers] = useState<number | null>(null);
  const [intermediateSize, setIntermediateSize] = useState<number | null>(null);
  const [deviceMemory, setDeviceMemory] = useState<number | null>(null);
  const [isPrefillChunking, setIsPrefillChunking] = useState<boolean>(false);
  const [modelSelectionTab, setModelSelectionTab] = useState<boolean>(true);
  const [deviceSelectionTab, setDeviceSelectionTab] = useState<boolean>(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Toggle Between Standard and Prefill Chunking */}
      <div className="mb-4 flex space-x-4">
        <button
          style={{ transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out' }}
          className={`${!isPrefillChunking ? 'calculator-input-tab-active' : 'calculator-input-tab'}`}
          onClick={() => setIsPrefillChunking(false)}
        >
          Standard Calculator
        </button>
        <button
          style={{ transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out' }}
          className={`${isPrefillChunking ? 'calculator-input-tab-active' : 'calculator-input-tab'}`}
          onClick={() => setIsPrefillChunking(true)}
        >
          Calculator with Prefill Chunking
        </button>
      </div>

      {/* Model and Device Selection */}
      <div className="w-full max-w-4xl">
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }} className="text-4xl mb-4 text-center">Model Memory Calculator</div>
        <div className="mb-6 text-center">
          Use our Model Memory Calculator to help you estimate the memory footprint of your model
          and the maximum batch size/sequence length combination you can run on your device.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Model Selection */}
          <div className="calculator-input-box">
            <div className="text-2xl calculator-input-title">Model</div>
            <div className="calculator-input-content">
              <div className="mb-2">
                <button
                  style={{ transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out' }}
                  className={`${modelSelectionTab ? 'calculator-input-tab-active' : 'calculator-input-tab'}`}
                  onClick={() => setModelSelectionTab(true)}
                >
                  Model Selection
                </button>
                <button
                  style={{ transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out' }}
                  className={`${modelSelectionTab ? 'calculator-input-tab' : 'calculator-input-tab-active'}`}
                  onClick={() => setModelSelectionTab(false)}
                >
                  Custom Model
                </button>
              </div>
              <div>
                {modelSelectionTab ? (
                  <>
                    <label htmlFor="model">Select a Model</label>
                    <select
                      id="model"
                      className="calculator-select"
                      style={{ transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                      onChange={(e) => {
                        const selectedModel = MODELS.find(
                          (model) => model.params === Number(e.target.value)
                        );
                        if (selectedModel) {
                          setModelParams(selectedModel.params);
                          setHiddenSize(selectedModel.hidden_size);
                          setNumLayers(selectedModel.num_hidden_layers);
                          setIntermediateSize(selectedModel.intermediate_size);
                        }
                      }}
                    >
                      <option value="">None selected</option>
                      {MODELS.map((model) => (
                        <option key={model.name} value={model.params}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label htmlFor="modelParams">Model Parameters (in billions)</label>
                    <input
                      type="number"
                      id="modelParams"
                      className="calculator-input mb-2"
                      placeholder="e.g. 7 (for LLaMA-7B)"
                      style={{ transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                      value={modelParams || ''}
                      min={0}
                      onChange={(e) => setModelParams(Number(e.target.value))}
                    />
                    <label htmlFor="hiddenSize">Hidden Size</label>
                    <input
                      type="number"
                      id="hiddenSize"
                      className="calculator-input mb-2"
                      placeholder="e.g. 4096 (for LLaMA-7B)"
                      style={{ transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                      value={hiddenSize || ''}
                      min={1}
                      onChange={(e) => setHiddenSize(Number(e.target.value))}
                    />
                    <label htmlFor="numLayers">Number of Layers</label>
                    <input
                      type="number"
                      id="numLayers"
                      className="calculator-input"
                      placeholder="e.g. 32 (for LLaMA-7B)"
                      style={{ transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                      value={numLayers || ''}
                      min={1}
                      onChange={(e) => setNumLayers(Number(e.target.value))}
                    />
                    {isPrefillChunking && (
                      <>
                        <label htmlFor="intermediateSize">Intermediate Size</label>
                        <input
                          type="number"
                          id="intermediateSize"
                          className="calculator-input"
                          placeholder="e.g. 11008 (for LLaMA-7B)"
                          style={{ transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                          value={intermediateSize || ''}
                          min={1}
                          onChange={(e) => setIntermediateSize(Number(e.target.value))}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Device Selection */}
          <div className="calculator-input-box">
            <div className="text-2xl calculator-input-title">Device</div>
            <div className="calculator-input-content">
              <div className="mb-2">
                <button
                  style={{ transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out' }}
                  className={`${deviceSelectionTab ? 'calculator-input-tab-active' : 'calculator-input-tab'}`}
                  onClick={() => {
                    setDeviceSelectionTab(true);
                    setDeviceMemory(null);
                  }}
                >
                  Device Selection
                </button>
                <button
                  style={{ transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out' }}
                  className={`${deviceSelectionTab ? 'calculator-input-tab' : 'calculator-input-tab-active'}`}
                  onClick={() => {
                    setDeviceSelectionTab(false);
                    setDeviceMemory(null);
                  }}
                >
                  Custom Device
                </button>
              </div>
              <div>
                {deviceSelectionTab ? (
                  <>
                    <label htmlFor="device">Select a Device</label>
                    <select
                      id="device"
                      className="calculator-select"
                      style={{ transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                      onChange={(e) => setDeviceMemory(Number(e.target.value))}
                    >
                      <option value="">None selected</option>
                      {DEVICES.map((device) => (
                        <option key={device.name} value={device.size}>
                          {device.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label htmlFor="deviceMemory">Device RAM (in GB)</label>
                    <input
                      type="number"
                      id="deviceMemory"
                      className="calculator-input"
                      placeholder="e.g. 24"
                      style={{ transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                      value={deviceMemory || ''}
                      min={0}
                      onChange={(e) => setDeviceMemory(Number(e.target.value))}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Render Appropriate Calculator Based on Toggle */}
        {isPrefillChunking ? (
          <PrefillChunkingCalculator
            deviceMemory={deviceMemory!}
            modelParams={modelParams!}
            hiddenSize={hiddenSize!}
            numLayers={numLayers!}
            intermediateSize={intermediateSize!}
          />
        ) : (
          <StandardCalculator
            deviceMemory={deviceMemory!}
            modelParams={modelParams!}
            hiddenSize={hiddenSize!}
            numLayers={numLayers!}
          />
        )}
      </div>
    </div>
  );
};

export default Calculator;
