using ActividadS4.API.DTOs;
using ActividadS4.API.Models;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ActividadS4.API.Services
{
    /// <summary>
    /// RoomService implementa la gestión de habitaciones
    /// Permite obtener, crear, editar y eliminar habitaciones
    /// Solo gerentes pueden crear, editar y eliminar
    /// </summary>
    public class RoomService : IRoomService
    {
        private readonly FirebaseService _firebaseService;

        /// <summary>
        /// Constructor: Recibe FirebaseService inyectado
        /// Se usa para acceder a Firestore
        /// </summary>
        public RoomService(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        /// <summary>
        /// GetAllRooms: Obtiene todas las habitaciones (con filtro opcional por tipo)
        /// </summary>
        public async Task<List<RoomDto>> GetAllRooms(string? type = null)
        {
            try
            {
                var roomsCollection = _firebaseService.GetCollection("rooms");

                Query query = roomsCollection;
                // Si se especifica tipo, filtrar por él
                if (!string.IsNullOrWhiteSpace(type))
                {
                    query = query.WhereEqualTo("Type", type);
                }

                // Obtener snapshot (lectura de datos)
                var snapshot = await query.GetSnapshotAsync();

                // Convertir cada documento a RoomDto
                var rooms = new List<RoomDto>();
                foreach (var doc in snapshot.Documents)
                {
                    var roomDict = doc.ToDictionary();
                    var room = ConvertDictToRoom(roomDict);
                    rooms.Add(ConvertToDto(room));
                }

                return rooms;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener habitaciones: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// GetRoomById: Obtiene una habitación específica por su ID
        /// </summary>
        public async Task<RoomDto?> GetRoomById(string roomId)
        {
            try
            {
                var roomsCollection = _firebaseService.GetCollection("rooms");
                var doc = await roomsCollection.Document(roomId).GetSnapshotAsync();

                // Si el documento no existe
                if (!doc.Exists)
                {
                    return null;
                }

                // Convertir a Room y luego a RoomDto
                var roomDict = doc.ToDictionary();
                var room = ConvertDictToRoom(roomDict);
                return ConvertToDto(room);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener habitación: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// CreateRoom: Crea una nueva habitación (solo gerente)
        /// </summary>
        public async Task<Room> CreateRoom(Room room, string managerId)
        {
            try
            {
                // Validar que los datos requeridos existen
                if (string.IsNullOrWhiteSpace(room.RoomNumber))
                {
                    throw new ArgumentException("El número o nombre de habitación es requerido");
                }
                if (string.IsNullOrWhiteSpace(room.Type))
                {
                    throw new ArgumentException("El tipo de habitación es requerido");
                }

                // Generar ID si no lo tiene
                if (string.IsNullOrWhiteSpace(room.Id))
                {
                    room.Id = Guid.NewGuid().ToString();
                }

                // Establecer información de auditoría
                room.CreatedAt = DateTime.UtcNow;
                room.CreatedBy = managerId;

                // Inicializar contadores de reseñas
                room.AverageRating = 0;
                room.TotalRatings = 0;

                // Guardar en Firestore usando Dictionary
                var roomData = new Dictionary<string, object>
                {
                    { "Id", room.Id },
                    { "NumberOrName", room.RoomNumber },
                    { "Type", room.Type },
                    { "Capacity", room.Capacity },
                    { "Description", room.Description ?? "" },
                    { "BasePricePerNight", room.BasePricePerNight },
                    { "AverageRating", room.AverageRating },
                    { "TotalRatings", room.TotalRatings },
                    { "CreatedAt", room.CreatedAt },
                    { "CreatedBy", room.CreatedBy }
                };

                var roomsCollection = _firebaseService.GetCollection("rooms");
                await roomsCollection.Document(room.Id).SetAsync(roomData);

                Console.WriteLine($"Habitación creada: {room.RoomNumber} ({room.Id})");
                return room;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al crear habitación: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// UpdateRoom: Edita una habitación existente (solo gerente)
        /// </summary>
        public async Task<Room> UpdateRoom(string roomId, Room room, string managerId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(roomId))
                {
                    throw new ArgumentException("El ID de habitación es requerido");
                }

                var roomsCollection = _firebaseService.GetCollection("rooms");

                // Verificar que la habitación existe
                var existingDoc = await roomsCollection.Document(roomId).GetSnapshotAsync();
                if (!existingDoc.Exists)
                {
                    throw new InvalidOperationException($"Habitación con ID {roomId} no existe");
                }

                // Obtener la habitación existente para preservar campos de auditoría
                var existingDict = existingDoc.ToDictionary();
                var existingRoom = ConvertDictToRoom(existingDict);

                // Actualizar solo los campos permitidos
                existingRoom.RoomNumber = room.RoomNumber ?? existingRoom.RoomNumber;
                existingRoom.Type = room.Type ?? existingRoom.Type;
                existingRoom.Capacity = room.Capacity > 0 ? room.Capacity : existingRoom.Capacity;
                existingRoom.Description = room.Description ?? existingRoom.Description;
                existingRoom.BasePricePerNight = room.BasePricePerNight > 0 ? room.BasePricePerNight : existingRoom.BasePricePerNight;

                // Guardar cambios usando Dictionary
                var roomData = new Dictionary<string, object>
                {
                    { "Id", existingRoom.Id },
                    { "NumberOrName", existingRoom.RoomNumber },
                    { "Type", existingRoom.Type },
                    { "Capacity", existingRoom.Capacity },
                    { "Description", existingRoom.Description },
                    { "BasePricePerNight", existingRoom.BasePricePerNight },
                    { "AverageRating", existingRoom.AverageRating },
                    { "TotalRatings", existingRoom.TotalRatings },
                    { "CreatedAt", existingRoom.CreatedAt },
                    { "CreatedBy", existingRoom.CreatedBy }
                };

                await roomsCollection.Document(roomId).SetAsync(roomData);

                Console.WriteLine($"Habitación actualizada: {roomId}");
                return existingRoom;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al actualizar habitación: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// DeleteRoom: Elimina una habitación (solo gerente)
        /// </summary>
        public async Task DeleteRoom(string roomId, string managerId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(roomId))
                {
                    throw new ArgumentException("El ID de habitación es requerido");
                }

                var roomsCollection = _firebaseService.GetCollection("rooms");
                var ratingsCollection = _firebaseService.GetCollection("roomRatings");

                // Verificar que la habitación existe
                var roomDoc = await roomsCollection.Document(roomId).GetSnapshotAsync();
                if (!roomDoc.Exists)
                {
                    throw new InvalidOperationException($"Habitación con ID {roomId} no existe");
                }

                // Verificar que no tiene reseñas
                var ratingsQuery = await ratingsCollection
                    .WhereEqualTo("RoomId", roomId)
                    .GetSnapshotAsync();

                if (ratingsQuery.Count > 0)
                {
                    throw new InvalidOperationException(
                        $"No se puede eliminar. La habitación tiene {ratingsQuery.Count} reseñas. " +
                        "Debe eliminar las reseñas primero."
                    );
                }

                // Eliminar la habitación
                await roomsCollection.Document(roomId).DeleteAsync();

                Console.WriteLine($"Habitación eliminada: {roomId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar habitación: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// SearchRooms: Busca habitaciones por número/nombre o tipo (búsqueda simple)
        /// </summary>
        public async Task<List<RoomDto>> SearchRooms(string searchTerm)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return new List<RoomDto>();
                }

                // Obtener todas las habitaciones
                var allRooms = await GetAllRooms();

                // Filtrar por número/nombre o tipo que contiene el término de búsqueda
                var searchLower = searchTerm.ToLower();
                var results = allRooms
                    .Where(r => r.NumberOrName.ToLower().Contains(searchLower) ||
                                r.Type.ToLower().Contains(searchLower))
                    .ToList();

                return results;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al buscar habitaciones: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Método privado auxiliar: ConvertToDto
        /// Convierte un Room (modelo interno) a RoomDto (lo que se envía al frontend)
        /// </summary>
        private RoomDto ConvertToDto(Room room)
        {
            return new RoomDto
            {
                Id = room.Id,
                NumberOrName = room.RoomNumber,
                Type = room.Type,
                Capacity = room.Capacity,
                Description = room.Description,
                BasePricePerNight = room.BasePricePerNight,
                AverageRating = room.AverageRating,
                TotalRatings = room.TotalRatings
            };
        }

        /// <summary>
        /// Método privado auxiliar: ConvertDictToRoom
        /// Convierte un diccionario de Firestore a objeto Room
        /// </summary>
        private Room ConvertDictToRoom(Dictionary<string, object> dict)
        {
            return new Room
            {
                Id = dict["Id"].ToString(),
                RoomNumber = dict["NumberOrName"].ToString(),
                Type = dict["Type"].ToString(),
                Capacity = (int)(long)dict["Capacity"],
                Description = dict["Description"].ToString(),
                BasePricePerNight = Convert.ToDecimal(dict["BasePricePerNight"]),
                AverageRating = Convert.ToDouble(dict["AverageRating"]),
                TotalRatings = (int)(long)dict["TotalRatings"],
                CreatedAt = ((Timestamp)dict["CreatedAt"]).ToDateTime(),
                CreatedBy = dict["CreatedBy"].ToString()
            };
        }
    }
}
