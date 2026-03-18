export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  totalCost: number;
  status: string;
  timestamp: Date;
}

export interface ReservationRequest {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
}
