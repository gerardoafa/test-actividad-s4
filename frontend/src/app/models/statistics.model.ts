export interface ReservationStatistics {
  totalRooms: number;
  totalNightsReserved: number;
  occupancyPercentage: number;
  totalRevenue: number;
  cancellationFees: number;
  reservationsByRoomType: { [key: string]: number };
  revenueByPeriod: { [key: string]: number };
}
