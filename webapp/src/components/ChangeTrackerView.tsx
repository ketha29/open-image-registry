import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { ChangeTrackerEventInfo } from "../types/app_types";

export type ChangeTrackerViewProps = {
  data: ChangeTrackerEventInfo[];
  width: number;
  height: number;
  filters: { add: boolean; delete: boolean; change: boolean };
  onPeriodChange: (start: Date, end: Date) => void;
  period: 12 | 6 | 3 | 1; // months
};

const CELL_SIZE = 16;
const CELL_PADDING = 2;
const Y_AXIS_WIDTH = 40;
const X_AXIS_HEIGHT = 30;
const YAxisWeeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CellData = {
  date: Date;
  dayOfWeek: number;
  weekIndex: number;
  add: ChangeTrackerEventInfo[];
  change: ChangeTrackerEventInfo[];
  delete: ChangeTrackerEventInfo[];
};

const getEventTypes = (cell: CellData, filters: ChangeTrackerViewProps['filters']) => {
  const types = [];
  if (cell.add.length > 0 && filters.add) types.push('add');
  if (cell.change.length > 0 && filters.change) types.push('change');
  if (cell.delete.length > 0 && filters.delete) types.push('delete');
  return types;
};

const getColorForType = (type: string): string => {
  if (type === 'delete') return '#ef4444';
  if (type === 'add') return '#36a288';
  if (type === 'change') return '#eab308';
  return '#e5e7eb';
};

const ChangeTrackerView = (props: ChangeTrackerViewProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  // Generate all dates in the range and group events
  const cellData = useMemo(() => {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - props.period);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    startDate.setHours(0, 0, 0, 0);

    const grouped: { [key: string]: CellData } = {};

    // Initialize all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = currentDate.toISOString().split('T')[0];
      const weekIndex = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

      grouped[key] = {
        date: new Date(currentDate),
        dayOfWeek: currentDate.getDay(),
        weekIndex,
        add: [],
        change: [],
        delete: [],
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate with actual events
    props.data.forEach((event) => {
      const eventDate = new Date(event.timestamp);
      eventDate.setHours(0, 0, 0, 0);
      const key = eventDate.toISOString().split('T')[0];

      if (grouped[key]) {
        if (event.type === 'add') {
          grouped[key].add.push(event);
        } else if (event.type === 'change') {
          grouped[key].change.push(event);
        } else if (event.type === 'delete') {
          grouped[key].delete.push(event);
        }
      }
    });

    const result = Object.values(grouped);

    // Call the callback with date range
    props.onPeriodChange(startDate, endDate);

    return result;
  }, [props.data, props.period, props.onPeriodChange]);

  // Calculate grid dimensions
  const maxWeekIndex = useMemo(() => {
    return Math.max(...cellData.map((c) => c.weekIndex), 0);
  }, [cellData]);

  const gridWidth = (maxWeekIndex + 1) * (CELL_SIZE + CELL_PADDING);
  const gridHeight = 7 * (CELL_SIZE + CELL_PADDING);
  const svgWidth = gridWidth + Y_AXIS_WIDTH + 20;
  const svgHeight = gridHeight + X_AXIS_HEIGHT + 40;

  useEffect(() => {
    if (!svgRef.current || cellData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add month labels (X-axis)
    const monthMap = new Map<string, number>();
    cellData.forEach((d) => {
      const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, d.date.getMonth());
      }
    });

    const monthLabelsGroup = svg.append('g').attr('class', 'month-labels');

    const monthLabelData: Array<{ month: string; weekIndex: number }> = [];
    monthMap.forEach((monthNum, key) => {
      const cells = cellData.filter(
        (d) => `${d.date.getFullYear()}-${d.date.getMonth()}` === key
      );
      if (cells.length > 0) {
        const selectedCell = cells.length == 1 ? cells[0] : cells[Math.floor(cells.length / 2)]

        const firstCell = cells[0];
        monthLabelData.push({
          month: new Date(selectedCell.date.getFullYear(), selectedCell.date.getMonth())
            .toLocaleDateString('en-US', { month: 'short' })
            .toUpperCase(),
          weekIndex: selectedCell.weekIndex,
        });
      }
    });

    monthLabelsGroup
      .selectAll('text')
      .data(monthLabelData)
      .enter()
      .append('text')
      .attr('x', (d) => Y_AXIS_WIDTH + d.weekIndex * (CELL_SIZE + CELL_PADDING))
      .attr('y', 15)
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .attr('text-anchor', 'start')
      .text((d) => d.month);

    // Add day labels (Y-axis)
    const dayLabelsGroup = svg.append('g').attr('class', 'day-labels');
    dayLabelsGroup
      .selectAll('text')
      .data(YAxisWeeks)
      .enter()
      .append('text')
      .attr('x', Y_AXIS_WIDTH - 10)
      .attr('y', (d, i) => X_AXIS_HEIGHT + i * (CELL_SIZE + CELL_PADDING) + CELL_SIZE - 2)
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .attr('text-anchor', 'end')
      .text((d) => d);

    // Add cells
    const cellsGroup = svg.append('g').attr('class', 'cells');

    cellData.forEach((d) => {
      const x = Y_AXIS_WIDTH + d.weekIndex * (CELL_SIZE + CELL_PADDING);
      const y = X_AXIS_HEIGHT + d.dayOfWeek * (CELL_SIZE + CELL_PADDING);
      const eventTypes = getEventTypes(d, props.filters);

      const cellGroup = cellsGroup
        .append('g')
        .attr('class', 'cell-group')
        .style('cursor', 'pointer');

      if (eventTypes.length === 0) {
        // No activity - single gray cell
        cellGroup
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE)
          .attr('fill', '#e5e7eb')
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .attr('rx', 2);
      } else if (eventTypes.length === 1) {
        // Single event type - single colored cell
        cellGroup
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE)
          .attr('fill', getColorForType(eventTypes[0]))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .attr('rx', 2);
      } else if (eventTypes.length === 2) {
        // Two event types - split horizontally
        cellGroup
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE / 2)
          .attr('fill', getColorForType(eventTypes[0]))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .attr('rx', 2);

        cellGroup
          .append('rect')
          .attr('x', x)
          .attr('y', y + CELL_SIZE / 2)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE / 2)
          .attr('fill', getColorForType(eventTypes[1]))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .attr('rx', 2);
      } else if (eventTypes.length === 3) {
        // Three event types - split as per design
        // Top-left: add
        cellGroup
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', CELL_SIZE / 2)
          .attr('height', CELL_SIZE / 2)
          .attr('fill', getColorForType('add'))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .attr('rx', 2);

        // Top-right: change
        cellGroup
          .append('rect')
          .attr('x', x + CELL_SIZE / 2)
          .attr('y', y)
          .attr('width', CELL_SIZE / 2)
          .attr('height', CELL_SIZE / 2)
          .attr('fill', getColorForType('change'))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .attr('rx', 2);

        // Bottom: delete (full width)
        cellGroup
          .append('rect')
          .attr('x', x)
          .attr('y', y + CELL_SIZE / 2)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE / 2)
          .attr('fill', getColorForType('delete'))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .attr('rx', 2);
      }

      // Add invisible overlay for hover/click events
      const overlay = cellGroup
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('fill', 'transparent')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('rx', 2);

      cellGroup
        .on('mouseenter', function () {
          overlay.attr('stroke', '#000').attr('stroke-width', 1.5);

          const dateStr = d.date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          const contentParts = [dateStr, ''];

          // Show actual messages
          if (d.add.length > 0) {
            contentParts.push(`Added (${d.add.length}):`);
            d.add.forEach((event) => {
              contentParts.push(`  • ${event.message || 'No message'}`);
            });
          }

          if (d.change.length > 0) {
            if (contentParts.length > 2) contentParts.push('');
            contentParts.push(`Changed (${d.change.length}):`);
            d.change.forEach((event) => {
              contentParts.push(`  • ${event.message || 'No message'}`);
            });
          }

          if (d.delete.length > 0) {
            if (contentParts.length > 2) contentParts.push('');
            contentParts.push(`Deleted (${d.delete.length}):`);
            d.delete.forEach((event) => {
              contentParts.push(`  • ${event.message || 'No message'}`);
            });
          }

          if (d.add.length === 0 && d.change.length === 0 && d.delete.length === 0) {
            contentParts.push('No activity');
          }

          const rect = overlay.node()?.getBoundingClientRect();
          if (rect) {
            setTooltip({
              visible: true,
              x: Math.round(rect.left + rect.width / 2),
              y: Math.round(rect.top - 10),
              content: contentParts.join('\n'),
            });
          }
        })
        .on('mouseleave', function () {
          overlay.attr('stroke', '#e5e7eb').attr('stroke-width', 0.5);
          setTooltip({ visible: false, x: 0, y: 0, content: '' });
        });
    });
  }, [cellData, props.filters]);

  return (
    <div className="relative overflow-auto">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: 'white',
          display: 'block',
        }}
      />
      {tooltip.visible && (
        <div
          className="fixed bg-gray-900 text-white text-xs px-3 py-2 rounded pointer-events-none z-50 whitespace-pre-line max-w-md"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ChangeTrackerView;