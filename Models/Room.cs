using Google.Cloud.Firestore;

namespace ActividadS4.API.Models
{
    /// <summary>
    /// Esto representa una habitación del hotel en el sistema 
    /// </summary>
    [FirestoreData]
    public class Room
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;
        //Numero de habitacion (ejemplo: 110, 179)

        [FirestoreProperty]
        public string RoomNumber { get; set; } = string.Empty;
        //Tipo de habitacion si es simple, doble, suit, familiar

        [FirestoreProperty]
        public string Type {  get; set; } = string.Empty;
        // Capacidad de personas por habitacion

        [FirestoreProperty]
        public int Capacity { get; set; }
        // Lista de servicios disponibles 

        [FirestoreProperty]
        public List<string> Amenities { get; set; } = new();
        //Lista de URLs de fotos de la habitacion guardadas

        [FirestoreProperty]
        public List<string> PhotoUrls { get; set; } = new();
        //Precio base por noche 

        [FirestoreProperty]
        public decimal BaseRate { get; set; }
        //Este es un contador para ver cuantas veces ha sido reservada esta habitacion

        [FirestoreProperty]
        public int ReservationCount { get; set; }
        //Aqui se indica si la habitacion esta disponible para hacer nuevas reservas

        [FirestoreProperty]
        public bool IsAvailable { get; set; } = true;
        //La fecha y hora en que el gerente hizo el registro de la habitacion

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }
        //ID del gerente que creo la habitacion

        [FirestoreProperty]
        public string CreatedBy { get; set; } = string.Empty;




    }
}
