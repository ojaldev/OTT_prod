import { ChartConfiguration } from 'chart.js';

export const generateColors = (count: number): string[] => {
  const baseColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generate additional colors using HSL
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360;
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  return colors;
};

export const createChartConfig = (
  type: string,
  data: any[],
  options: Partial<ChartConfiguration> = {}
): ChartConfiguration => {
  const colors = generateColors(data.length);
  
  const baseConfig: ChartConfiguration = {
    type: type as any,
    data: {
      labels: data.map(item => item._id || item.label),
      datasets: [{
        data: data.map(item => item.count || item.value),
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y || context.parsed;
              return `${context.label}: ${value}`;
            }
          }
        }
      }
    }
  };

  return { ...baseConfig, ...options };
};

export const formatChartData = (rawData: any[], xField: string, yField: string) => {
  return rawData.map(item => ({
    x: item[xField],
    y: item[yField],
    label: item._id || item[xField]
  }));
};

export const aggregateData = (
  data: any[], 
  groupBy: string, 
  aggregateField: string, 
  aggregationType: 'sum' | 'count' | 'avg' = 'count'
) => {
  const grouped = data.reduce((acc, item) => {
    const key = item[groupBy];
    if (!acc[key]) {
      acc[key] = { _id: key, items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  return Object.values(grouped).map((group: any) => {
    let value: number;
    
    switch (aggregationType) {
      case 'sum':
        value = group.items.reduce((sum: number, item: any) => sum + (item[aggregateField] || 0), 0);
        break;
      case 'avg':
        const sum = group.items.reduce((sum: number, item: any) => sum + (item[aggregateField] || 0), 0);
        value = sum / group.items.length;
        break;
      case 'count':
      default:
        value = group.items.length;
        break;
    }
    
    return { _id: group._id, count: value };
  });
};
