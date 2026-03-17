namespace ActividadS4.API.Services

{
    using ActividadS4.API.DTOs;
    using ActividadS4.API.Models;

    /// <summary>
    /// Implementa la lógica de negocio para el sistema de reservas.
    /// Un huésped solo puede realizar UNA reserva en todo el sistema.
    /// </summary>
    public class ReservationService : IReservationService
    {
        private readonly FirebaseService _firebaseService;
        private readonly ILogger<ReservationService> _logger;

        // Impuesto aplicado al costo total de la reserva (15%)
        private const decimal TAX_RATE = 0.15m;

        /// <summary>Constructor que recibe las dependencias inyectadas</summary>
        public ReservationService(FirebaseService firebaseService, ILogger<ReservationService> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        /// <summary>
        /// Crea una reserva para el huésped.
        /// Valida que no haya reservado antes y que las fechas sean válidas.
        /// Calcula automáticamente noches y costo total con impuestos.
        /// </summary>
        public async Task<Reservation> CreateReservationAsync(ReservationDto dto, string userId)
        {
            try
            {
                var usersCollection = _firebaseService.GetCollection("users");
                var roomsCollection = _firebaseService.GetCollection("rooms");
                var reservationsCollection = _firebaseService.GetCollection("reservations");

                // Paso 1: Verificar que el huésped no haya reservado antes (reserva única)
                var userDoc = await usersCollection.Document(userId).GetSnapshotAsync();
                if (!userDoc.Exists)
                    throw new InvalidOperationException("Usuario no encontrado");

                var user = userDoc.ConvertTo<User>();

                if (user.HasReserved)
                    throw new InvalidOperationException(
                        "Ya realizaste una reserva. El sistema solo permite una reserva por huésped");

                // Paso 2: Verificar que la habitación existe y está disponible
                var roomDoc = await roomsCollection.Document(dto.RoomId).GetSnapshotAsync();
                if (!roomDoc.Exists)
                    throw new InvalidOperationException("Habitación no encontrada");

                var room = roomDoc.ConvertTo<Room>();

                if (!room.IsAvailable)
                    throw new InvalidOperationException("La habitación no está disponible");

                // Paso 3: Validar fechas
                if (dto.CheckInDate >= dto.CheckOutDate)
                    throw new ArgumentException("La fecha de salida debe ser posterior a la de entrada");

                if (dto.CheckInDate < DateTime.UtcNow.Date)
                    throw new ArgumentException("La fecha de entrada no puede ser en el pasado");

                // Paso 4: Calcular noches y costo total con impuestos
                var nights = (int)(dto.CheckOutDate - dto.CheckInDate).TotalDays;
                var subtotal = room.BaseRate * nights;
                var totalCost = subtotal * (1 + TAX_RATE); // Precio + 15% impuesto

                // Paso 5: Crear la reserva
                var reservation = new Reservation
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    UserName = user.Fullname,
                    RoomId = dto.RoomId,
                    RoomNumber = room.RoomNumber,
                    RoomType = room.Type,
                    CheckInDate = dto.CheckInDate,
                    CheckOutDate = dto.CheckOutDate,
                    Nights = nights,
                    TotalCost = totalCost,
                    Status = "confirmed",
                    Timestamp = DateTime.UtcNow
                };

                // Paso 6: Guardar la reserva en Firestore (registro inmutable)
                await reservationsCollection.Document(reservation.Id).SetAsync(reservation);

                // Paso 7: Actualizar el usuario - marcar como que ya reservó
                var reservedDates = $"{dto.CheckInDate:dd/MM/yyyy} - {dto.CheckOutDate:dd/MM/yyyy}";
                await usersCollection.Document(userId).UpdateAsync(
                    new Dictionary<string, object>
                    {
                    { "HasReserved", true },
                    { "ReservedRoom", room.RoomNumber },
                    { "ReservedDates", reservedDates },
                    { "ReservationTimestamp", DateTime.UtcNow }
                    });

                // Paso 8: Incrementar el contador de reservas de la habitación
                await roomsCollection.Document(dto.RoomId).UpdateAsync(
                    new Dictionary<string, object>
                    {
                    { "ReservationCount", room.ReservationCount + 1 }
                    });

                _logger.LogInformation(
                    $"Reserva creada: Huésped {user.Fullname} reservó habitación {room.RoomNumber}");

                return reservation;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear reserva: {ex.Message}");
                throw;
            }
        }

        /// <summary>Obtiene todas las reservas del sistema (solo para el gerente)</summary>
        public async Task<List<Reservation>> GetAllReservationsAsync()
        {
            try
            {
                var collection = _firebaseService.GetCollection("reservations");
                var snapshot = await collection.GetSnapshotAsync();

                return snapshot.Documents
                    .Select(doc => doc.ConvertTo<Reservation>())
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener reservas: {ex.Message}");
                throw;
            }
        }

        /// <summary>Obtiene la reserva de un huésped específico por su ID</summary>
        public async Task<Reservation?> GetReservationByUserIdAsync(string userId)
        {
            try
            {
                var collection = _firebaseService.GetCollection("reservations");

                var snapshot = await collection
                    .WhereEqualTo("UserId", userId)
                    .GetSnapshotAsync();

                if (snapshot.Count == 0)
                    return null;

                return snapshot.Documents[0].ConvertTo<Reservation>();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener reserva del usuario {userId}: {ex.Message}");
                return null;
            }
        }
    }
}
