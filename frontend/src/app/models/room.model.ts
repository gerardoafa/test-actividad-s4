export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  description: string;
  basePricePerNight: number;
  averageRating: number;
  totalRatings: number;
  isAvailable: boolean;
  reservationCount?: number;
  createdAt?: Date;
  createdBy?: string;
}
