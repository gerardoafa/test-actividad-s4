namespace ActividadS4.API.Services
{
    using ActividadS4.API.DTOs;
    using ActividadS4.API.Models;
    using Google.Cloud.Firestore;

    /// <summary>
    /// Implementa la lógica de negocio para gestión de habitaciones.
    /// Solo el gerente puede crear, editar y eliminar habitaciones.
    /// </summary>
    public class RoomService : IRoomService
    {
        private readonly FirebaseService _firebaseService;
        private readonly ILogger<RoomService> _logger;

        /// <summary>Constructor que recibe las dependencias inyectadas</summary>
        public RoomService(FirebaseService firebaseService, ILogger<RoomService> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        /// <summary>Obtiene todas las habitaciones registradas en Firestore</summary>
        public async Task<List<Room>> GetAllRoomsAsync()
        {
            try
            {
                var collection = _firebaseService.GetCollection("rooms");
                var snapshot = await collection.GetSnapshotAsync();

                // Convertir cada documento a objeto Room
                return snapshot.Documents
                    .Select(doc => doc.ConvertTo<Room>())
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener habitaciones: {ex.Message}");
                throw;
            }
        }

        /// <summary>Obtiene solo las habitaciones disponibles para reservar</summary>
        public async Task<List<Room>> GetAvailableRoomsAsync()
        {
            try
            {
                var collection = _firebaseService.GetCollection("rooms");

                // Filtrar solo habitaciones disponibles
                var snapshot = await collection
                    .WhereEqualTo("IsAvailable", true)
                    .GetSnapshotAsync();

                return snapshot.Documents
                    .Select(doc => doc.ConvertTo<Room>())
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener habitaciones disponibles: {ex.Message}");
                throw;
            }
        }

        /// <summary>Obtiene una habitación específica por su ID</summary>
        public async Task<Room?> GetRoomByIdAsync(string roomId)
        {
            try
            {
                var collection = _firebaseService.GetCollection("rooms");
                var doc = await collection.Document(roomId).GetSnapshotAsync();

                if (!doc.Exists)
                    return null;

                return doc.ConvertTo<Room>();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener habitación {roomId}: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Crea una nueva habitación en Firestore.
        /// Solo el gerente puede ejecutar esta acción.
        /// </summary>
        public async Task<Room> CreateRoomAsync(RoomDto dto, string managerId)
        {
            try
            {
                var collection = _firebaseService.GetCollection("rooms");

                // Crear el objeto Room desde el DTO
                var newRoom = new Room
                {
                    Id = Guid.NewGuid().ToString(),
                    RoomNumber = dto.RoomNumber,
                    Type = dto.Type,
                    Capacity = dto.Capacity,
                    Amenities = dto.Amenities,
                    PhotoUrls = dto.PhotoUrls,
                    BaseRate = dto.BaseRate,
                    IsAvailable = true,
                    ReservationCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = managerId  // ID del gerente que la creó
                };

                // Guardar en Firestore
                await collection.Document(newRoom.Id).SetAsync(newRoom);
                _logger.LogInformation($"Habitación {newRoom.RoomNumber} creada por gerente {managerId}");

                return newRoom;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear habitación: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Actualiza la información de una habitación existente.
        /// Solo el gerente puede ejecutar esta acción.
        /// </summary>
        public async Task<Room?> UpdateRoomAsync(string roomId, RoomDto dto)
        {
            try
            {
                var collection = _firebaseService.GetCollection("rooms");
                var doc = await collection.Document(roomId).GetSnapshotAsync();

                if (!doc.Exists)
                    return null;

                // Actualizar solo los campos editables
                await collection.Document(roomId).UpdateAsync(new Dictionary<string, object>
            {
                { "RoomNumber", dto.RoomNumber },
                { "Type", dto.Type },
                { "Capacity", dto.Capacity },
                { "Amenities", dto.Amenities },
                { "PhotoUrls", dto.PhotoUrls },
                { "BaseRate", dto.BaseRate },
                { "IsAvailable", dto.IsAvailable }
            });

                // Retornar la habitación actualizada
                return await GetRoomByIdAsync(roomId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar habitación {roomId}: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Elimina una habitación solo si no tiene reservas activas.
        /// Protege la integridad de los datos históricos.
        /// </summary>
        public async Task<bool> DeleteRoomAsync(string roomId)
        {
            try
            {
                var collection = _firebaseService.GetCollection("rooms");
                var doc = await collection.Document(roomId).GetSnapshotAsync();

                if (!doc.Exists)
                    return false;

                var room = doc.ConvertTo<Room>();

                // Verificar que no tenga reservas antes de eliminar
                if (room.ReservationCount > 0)
                    throw new InvalidOperationException(
                        "No se puede eliminar una habitación con reservas registradas");

                await collection.Document(roomId).DeleteAsync();
                _logger.LogInformation($"Habitación {roomId} eliminada correctamente");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al eliminar habitación {roomId}: {ex.Message}");
                throw;
            }
        }
    }
}
