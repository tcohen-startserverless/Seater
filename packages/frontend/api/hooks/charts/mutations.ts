import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { useApiClient } from '@/api';
import { chartKeys } from './keys';
import { ChartSchemas } from '@core/charts/chart';
import type { ChartItem } from '@core/charts/chart';
import { Schemas } from '@core/schema';
import { ChartsResponse, TransformedChartResponse } from '@core/charts';

export const useCreateChart = () => {
  const { client } = useApiClient();

  return useMutation<ChartItem, Error, ChartSchemas.Types.CreateInput>({
    mutationFn: async (params) => {
      if (!client) throw new Error('API client not initialized');
      const res = await client.chart.$post({
        json: params,
      });
      const chart = await res.json();
      // Safely handle potential missing data
      if (!chart || !chart.chartId) {
        throw new Error('Failed to create chart: Invalid response format');
      }
      return chart as ChartItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: chartKeys.byChart(data.userId, data.chartId),
      });
    },
  });
};

export const useUpdateChart = () => {
  type UpdateParams = Schemas.Types.Params & ChartSchemas.Types.PatchInput;
  const { client } = useApiClient();

  type PreviousChartData = { previousChart?: ChartsResponse | null };

  return useMutation<ChartItem, Error, UpdateParams, PreviousChartData>({
    mutationFn: async ({ id, ...params }: UpdateParams) => {
      if (!client) throw new Error('API client not initialized');
      const res = await client.chart[':id'].$patch({
        param: { id },
        json: params,
      });
      const chart = await res.json();
      // Safely handle potential missing data
      if (!chart || !chart.chartId) {
        throw new Error('Failed to update chart: Invalid response format');
      }
      return chart as ChartItem;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: chartKeys.detail(newData.id) });
      const previousChart = queryClient.getQueryData<ChartsResponse | null>(
        chartKeys.detail(newData.id)
      );

      if (previousChart?.data?.Chart?.[0]) {
        const updatedChart = {
          ...previousChart.data.Chart[0],
          ...newData,
        };

        queryClient.setQueryData(chartKeys.detail(newData.id), {
          ...previousChart,
          data: {
            ...previousChart.data,
            Chart: [updatedChart],
          },
        });
      }

      return { previousChart };
    },
    onError: (_, variables, context) => {
      if (context?.previousChart) {
        queryClient.setQueryData(chartKeys.detail(variables.id), context.previousChart);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chartKeys.detail(data.chartId) });
      queryClient.invalidateQueries({ queryKey: chartKeys.charts() });
    },
  });
};

export const useDeleteChart = () => {
  const { client } = useApiClient();
  type DeleteParams = Schemas.Types.Params;

  type ChartRef = { userId: string; chartId: string };
  type PreviousChartData = { previousChart?: ChartsResponse | null };

  return useMutation<ChartRef | null, Error, DeleteParams, PreviousChartData>({
    mutationFn: async ({ id }) => {
      if (!client) throw new Error('API client not initialized');
      const res = await client.chart[':id'].$delete({
        param: { id },
      });
      const deletedChart = await res.json();
      if (!deletedChart || !deletedChart.chartId) {
        return null;
      }
      return {
        userId: deletedChart.userId,
        chartId: deletedChart.chartId,
      };
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: chartKeys.detail(id) });
      const previousChart = queryClient.getQueryData<ChartsResponse | null>(
        chartKeys.detail(id)
      );

      queryClient.setQueryData(chartKeys.detail(id), undefined);

      // Update the list query cache
      queryClient.setQueryData<ChartsResponse | undefined>(chartKeys.charts(), (old) =>
        old && old.data?.Chart
          ? {
              ...old,
              data: {
                ...old.data,
                Chart: old.data.Chart.filter((chart) => chart.chartId !== id),
              },
            }
          : undefined
      );

      return { previousChart };
    },
    onError: (_, variables, context) => {
      if (context?.previousChart) {
        queryClient.setQueryData(chartKeys.detail(variables.id), context.previousChart);
      }
    },
    onSuccess: (data) => {
      if (!data) return;
      queryClient.invalidateQueries({ queryKey: chartKeys.detail(data.chartId) });
      queryClient.invalidateQueries({ queryKey: chartKeys.charts() });
    },
  });
};

export const useUpdateChartLayout = () => {
  const { client } = useApiClient();

  // Define the input type for the layout update
  interface UpdateLayoutParams {
    id: string;
    data: ChartSchemas.Types.UpdateLayoutInput;
  }

  interface LayoutUpdateResponse {
    transaction: {
      success: boolean;
      furnitureCreated: number;
      furnitureUpdated: number;
      furnitureDeleted: number;
      assignmentsCreated: number;
      assignmentsUpdated: number;
      assignmentsDeleted: number;
    };
    chart: TransformedChartResponse | null;
  }

  type PreviousChartData = { previousChart?: TransformedChartResponse | null };

  return useMutation<LayoutUpdateResponse, Error, UpdateLayoutParams, PreviousChartData>({
    mutationFn: async ({ id, data }) => {
      if (!client) throw new Error('API client not initialized');
      const res = await client.chart[':id'].layout.$patch({
        param: { id },
        json: data,
      });
      return res.json();
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: chartKeys.detail(id) });
      const previousChart = queryClient.getQueryData<TransformedChartResponse | null>(
        chartKeys.detail(id)
      );
      return { previousChart };
    },
    onError: (_, variables, context) => {
      if (context?.previousChart) {
        queryClient.setQueryData(chartKeys.detail(variables.id), context.previousChart);
      }
    },
    onSuccess: (data, variables) => {
      if (!data.chart) return;
      queryClient.invalidateQueries({ queryKey: chartKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: chartKeys.furniture(variables.id) });
      queryClient.invalidateQueries({ queryKey: chartKeys.assignments(variables.id) });
      queryClient.setQueryData(chartKeys.detail(variables.id), data.chart);
    },
  });
};
