import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineData, Time, WhitespaceData, DeepPartial, LineSeriesOptions, SeriesOptionsCommon, LineStyleOptions, UTCTimestamp } from 'lightweight-charts';

interface ChartProps {
  tick: { time: UTCTimestamp; value: number }|undefined;
  ticks: { time: UTCTimestamp; value: number }[];

}

type L = ISeriesApi<"Line", Time, LineData<Time> | WhitespaceData<Time>, LineSeriesOptions, DeepPartial<LineStyleOptions & SeriesOptionsCommon>>;

const Chart: React.FC<ChartProps> = ({ tick,ticks }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [c, setC] = useState<IChartApi|undefined>(undefined);
  const [s, setS] = useState<L|undefined>(undefined);

  
  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: 'black',
        },
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        timeScale: {
            timeVisible: true,
              secondsVisible: false,
            },
      });
      setC(chart)

      const lineSeries = chart.addLineSeries({ color: '#2962FF',  priceFormat: {
        minMove: 0.1,
        precision: 1
      } });
      setS(lineSeries);
      console.log(ticks)
      lineSeries.setData(ticks);

      chart.timeScale().fitContent();

      return () => {
        chart.remove();
      };
    }
  }, []);


  useEffect(() => {
    if (!!c && !!s && !!tick) {
      s.update(tick)
    }
  }, [c,s,tick]);

  return <div style={{ width: '100%', height: '100%' }} ref={chartContainerRef} />;
};

export default Chart;