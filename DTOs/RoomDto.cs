namespace ActividadS4.API.DTOs
{
    /// <summary>
    /// Datos para crear o editar alguna habitación.
    /// </summary>
    public class RoomDto
    {
        //Número de habitación visible 
        public string RoomNumber { get; set; } = string.Empty;

        //Tipo de habitación: Simple,Doble,Suite,Familiar
        public string Type { get; set; } = string.Empty;

        //Capacidad máxima de personas
        public int Capacity { get; set; }

        //Lista de Servicios
        public List<string> Amenities { get; set; } = new();

        //URLs de fotos de la habitación en FB
        public List<string> PhotoUrls { get; set; } = new();

        ///Precio base por noche 
        public decimal BaseRate { get; set; }

        //Indica si la habitación está disponible para reservas
        public bool IsAvailable { get; set; } = true;
    }
}
