import { useState } from 'react';
import axios from 'axios';
import { useCreate } from '@refinedev/core';
import type { TableModel } from '@/types';

// Định nghĩa các interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ReservationData {
  table_id: number;
  name: string;
  phone: string;
  reservation_date: string;
  number_of_guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

interface SearchTablesParams {
  date: string;
  time: string;
  number_of_guests: number;
}

interface CheckTableParams {
  table_id: number;
  date: string;
  time: string;
}

// Hook để tìm bàn trống
export const useSearchAvailableTables = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TableModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchTables = async (params: SearchTablesParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<ApiResponse<TableModel[]>>('/api/reservations/available-tables', {
        params
      });
      
      if (response.data.success) {
        setData(response.data.data);
        return { data: response.data.data, success: true };
      } else {
        setError(response.data.message || 'Không thể tìm bàn trống');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm bàn trống';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  return { searchTables, data, loading, error };
};

// Hook để kiểm tra bàn trống
export const useCheckTableAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkTable = async (params: CheckTableParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<ApiResponse<{is_available: boolean, table: TableModel}>>('/api/reservations/check-availability', {
        params
      });
      
      if (response.data.success) {
        return { 
          success: true, 
          isAvailable: response.data.data.is_available,
          table: response.data.data.table
        };
      } else {
        setError(response.data.message || 'Không thể kiểm tra bàn');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra bàn';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  return { checkTable, loading, error };
};

// Hook để đặt bàn
export const useCreateReservation = () => {
  const { mutate: createReservation, isLoading } = useCreate();
  const [error, setError] = useState<string | null>(null);
  
  const makeReservation = async (data: ReservationData, 
    callbacks?: { 
      onSuccess?: () => void, 
      onError?: (message: string) => void 
    }) => {
    try {
      createReservation(
        {
          resource: "reservations",
          values: data,
        }, 
        {
          onSuccess: () => {
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            const message = err?.message || 'Đặt bàn thất bại';
            setError(message);
            callbacks?.onError?.(message);
          }
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt bàn';
      setError(errorMessage);
      callbacks?.onError?.(errorMessage);
    }
  };
  
  return { makeReservation, loading: isLoading, error };
}; 