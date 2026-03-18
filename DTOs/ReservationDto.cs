namespace ActividadS4.API.DTOs
{
    /// <summary>
    /// Datos que envía el huésped desde el Frontend para crear una reserva.
    /// El backend calcula automáticamente las noches y el costo total.
    /// </summary>
    public class ReservationDto
    {
        //ID de la habitación que desea reservar
        public string RoomId { get; set; } = string.Empty;

        //Fecha de entrada deseada por el huésped
        public DateTime CheckInDate { get; set; }

        //Fecha de salida deseada por el huésped
        public DateTime CheckOutDate { get; set; }
    }
}