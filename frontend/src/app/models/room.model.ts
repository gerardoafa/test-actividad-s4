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
  createdAt?: Date;
  createdBy?: string;
}

export interface RoomFormData {
  roomNumber: string;
  type: string;
  capacity: number;
  description: string;
  basePricePerNight: number;
}
