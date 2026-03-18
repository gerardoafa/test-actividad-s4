using Google.Cloud.Firestore;

namespace ActividadS4.API.Models;
/// <summary>
/// Aqui se representa una reserva realizada por un huesped
/// Es un registro que no se puede modificar una vez sea creado.
/// </summary>
[FirestoreData]
public class Reservation
{
    [FirestoreProperty]
    //Identificador único de la reserva generado por FS
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    //ID del usuario (huésped) que realizó la reserva
    public string UserId { get; set; } = string.Empty;

    [FirestoreProperty]
    //Nombre completo del huésped al momento de hacer la reserva
    public string UserName { get; set; } = string.Empty;

    [FirestoreProperty]
    //ID de la habitación reservada
    public string RoomId { get; set; } = string.Empty;

    [FirestoreProperty]
    //Número de habitación
    public string RoomNumber { get; set; } = string.Empty;

    [FirestoreProperty]
    //Tipo de habitación reservada 
    public string RoomType { get; set; } = string.Empty;

    [FirestoreProperty]
    //Fecha de check-in seleccionada por el huésped
    public DateTime CheckInDate { get; set; }

    [FirestoreProperty]
    //Fecha de check-out seleccionada por el huésped
    public DateTime CheckOutDate { get; set; }

    [FirestoreProperty]
    //Número de noches calculado automáticamente (CheckOut - CheckIn)
    public int Nights { get; set; }

    [FirestoreProperty]
    //Costo total de la reserva incluyendo impuestos (Noches × TarifaBase × 1.15
    public decimal TotalCost { get; set; }

    [FirestoreProperty]
    //Estado de la reserva: confirmed o pending
    public string Status { get; set; } = "confirmed";

    [FirestoreProperty]
    //Fecha y hora exacta en que se creó la reserva
    public DateTime Timestamp { get; set; }
}
