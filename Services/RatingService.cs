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
    /// RoomRatingService implementa la gestión de reseñas/calificaciones de habitaciones
    /// Permite crear, obtener, editar y eliminar reseñas de huéspedes
    /// </summary>
    public class RoomRatingService : IRoomRatingService
    {
        private readonly FirebaseService _firebaseService;
        private readonly IRoomService _roomService;
        private readonly IAuthService _authService;

        /// <summary>
        /// Constructor: Recibe dependencias inyectadas
        /// </summary>
        public RoomRatingService(
            FirebaseService firebaseService,
            IRoomService roomService,
            IAuthService authService)
        {
            _firebaseService = firebaseService;
            _roomService = roomService;
            _authService = authService;
        }

        /// <summary>
        /// GetRatingsByRoomId: Obtiene todas las reseñas de una habitación
        /// </summary>
        public async Task<List<ReservationRatingDto>> GetRatingsByRoomId(string roomId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(roomId))
                {
                    throw new ArgumentException("El ID de habitación es requerido");
                }

                var ratingsCollection = _firebaseService.GetCollection("roomRatings");

                // Query: Obtener reseñas donde RoomId == roomId
                // OrderByDescending: Ordenar por más reciente primero
                var query = ratingsCollection
                    .WhereEqualTo("RoomId", roomId)
                    .OrderByDescending("CreatedAt");

                var snapshot = await query.GetSnapshotAsync();

                // Convertir documentos a ReservationRatingDto
                var ratings = new List<ReservationRatingDto>();
                foreach (var doc in snapshot.Documents)
                {
                    var ratingDict = doc.ToDictionary();
                    var rating = ConvertDictToRating(ratingDict);
                    ratings.Add(ConvertToDto(rating));
                }

                return ratings;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener reseñas de habitación: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// GetRatingsByUserId: Obtiene todas las reseñas hechas por un huésped
        /// </summary>
        public async Task<List<ReservationRatingDto>> GetRatingsByUserId(string userId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(userId))
                {
                    throw new ArgumentException("El ID de usuario es requerido");
                }

                var ratingsCollection = _firebaseService.GetCollection("roomRatings");

                // Query: Obtener reseñas donde UserId == userId
                var query = ratingsCollection
                    .WhereEqualTo("UserId", userId)
                    .OrderByDescending("CreatedAt");

                var snapshot = await query.GetSnapshotAsync();

                // Convertir documentos a ReservationRatingDto
                var ratings = new List<ReservationRatingDto>();
                foreach (var doc in snapshot.Documents)
                {
                    var ratingDict = doc.ToDictionary();
                    var rating = ConvertDictToRating(ratingDict);
                    ratings.Add(ConvertToDto(rating));
                }

                return ratings;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener reseñas del usuario: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// CreateRating: Crea una nueva reseña/calificación de habitación
        /// </summary>
        public async Task<ReservationRating> CreateRating(CreateReservationRatingDto createRatingDto, string userId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(createRatingDto.RoomId))
                {
                    throw new ArgumentException("El ID de habitación es requerido");
                }
                if (createRatingDto.Score < 1 || createRatingDto.Score > 5)
                {
                    throw new ArgumentException("La calificación debe estar entre 1 y 5");
                }

                // Obtener la habitación para verificar que existe y obtener su nombre
                var roomDto = await _roomService.GetRoomById(createRatingDto.RoomId);
                if (roomDto == null)
                {
                    throw new InvalidOperationException("La habitación no existe");
                }

                // Obtener el usuario para obtener su nombre
                var user = await _authService.GetUserById(userId);
                if (user == null)
                {
                    throw new InvalidOperationException("El usuario no existe");
                }

                // Verificar que el usuario no ha calificado esta habitación antes
                var hasRated = await HasUserRatedRoom(userId, createRatingDto.RoomId);
                if (hasRated)
                {
                    throw new InvalidOperationException("Ya has calificado esta habitación");
                }

                // Crear la nueva reseña
                var newRating = new ReservationRating
                {
                    Id = Guid.NewGuid().ToString(),
                    RoomId = createRatingDto.RoomId,
                    RoomNameOrNumber = roomDto.NumberOrName,
                    UserId = userId,
                    GuestName = user.FullName,
                    Score = createRatingDto.Score,
                    Review = createRatingDto.Review ?? string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var ratingsCollection = _firebaseService.GetCollection("roomRatings");
                var roomsCollection = _firebaseService.GetCollection("rooms");

                // Guardar la nueva reseña usando Dictionary
                var ratingData = new Dictionary<string, object>
                {
                    { "Id", newRating.Id },
                    { "RoomId", newRating.RoomId },
                    { "RoomNameOrNumber", newRating.RoomNameOrNumber },
                    { "UserId", newRating.UserId },
                    { "GuestName", newRating.GuestName },
                    { "Score", newRating.Score },
                    { "Review", newRating.Review },
                    { "CreatedAt", newRating.CreatedAt },
                    { "UpdatedAt", newRating.UpdatedAt }
                };

                await ratingsCollection.Document(newRating.Id).SetAsync(ratingData);

                // Obtener todas las reseñas de esta habitación (incluyendo la nueva)
                var allRatingsForRoom = await ratingsCollection
                    .WhereEqualTo("RoomId", createRatingDto.RoomId)
                    .GetSnapshotAsync();

                // Calcular el nuevo promedio
                double totalScore = 0;
                foreach (var doc in allRatingsForRoom.Documents)
                {
                    var rating = doc.ToDictionary();
                    totalScore += Convert.ToDouble(rating["Score"]);
                }
                double averageRating = totalScore / allRatingsForRoom.Count;

                // Actualizar la habitación con el nuevo promedio y contador
                await roomsCollection.Document(createRatingDto.RoomId).UpdateAsync(
                    new Dictionary<string, object>
                    {
                        { "AverageRating", averageRating },
                        { "TotalRatings", allRatingsForRoom.Count }
                    }
                );

                // Actualizar TotalRatings del usuario (si lo tienes en el modelo User)
                var usersCollection = _firebaseService.GetCollection("users");
                await usersCollection.Document(userId).UpdateAsync(
                    new Dictionary<string, object>
                    {
                        { "TotalRatings", user.TotalRatings + 1 }
                    }
                );

                Console.WriteLine($"Reseña creada: Huésped {userId} calificó habitación {createRatingDto.RoomId}");
                return newRating;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al crear reseña: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// UpdateRating: Edita una reseña existente
        /// </summary>
        public async Task<ReservationRating> UpdateRating(string ratingId, CreateReservationRatingDto createRatingDto, string userId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(ratingId))
                {
                    throw new ArgumentException("El ID de reseña es requerido");
                }
                if (createRatingDto.Score < 1 || createRatingDto.Score > 5)
                {
                    throw new ArgumentException("La calificación debe estar entre 1 y 5");
                }

                var ratingsCollection = _firebaseService.GetCollection("roomRatings");
                var roomsCollection = _firebaseService.GetCollection("rooms");

                // Obtener la reseña existente
                var ratingDoc = await ratingsCollection.Document(ratingId).GetSnapshotAsync();
                if (!ratingDoc.Exists)
                {
                    throw new InvalidOperationException("La reseña no existe");
                }

                var existingDict = ratingDoc.ToDictionary();
                var existingRating = ConvertDictToRating(existingDict);

                // Verificar que el usuario es propietario
                if (existingRating.UserId != userId)
                {
                    throw new UnauthorizedAccessException("No tienes permiso para editar esta reseña");
                }

                // Actualizar score y review
                existingRating.Score = createRatingDto.Score;
                existingRating.Review = createRatingDto.Review ?? string.Empty;
                existingRating.UpdatedAt = DateTime.UtcNow;

                // Guardar cambios usando Dictionary
                var ratingData = new Dictionary<string, object>
                {
                    { "Id", existingRating.Id },
                    { "RoomId", existingRating.RoomId },
                    { "RoomNameOrNumber", existingRating.RoomNameOrNumber },
                    { "UserId", existingRating.UserId },
                    { "GuestName", existingRating.GuestName },
                    { "Score", existingRating.Score },
                    { "Review", existingRating.Review },
                    { "CreatedAt", existingRating.CreatedAt },
                    { "UpdatedAt", existingRating.UpdatedAt }
                };

                await ratingsCollection.Document(ratingId).SetAsync(ratingData);

                // Recalcular promedio de la habitación
                var allRatingsForRoom = await ratingsCollection
                    .WhereEqualTo("RoomId", existingRating.RoomId)
                    .GetSnapshotAsync();

                double totalScore = 0;
                foreach (var doc in allRatingsForRoom.Documents)
                {
                    var rating = doc.ToDictionary();
                    totalScore += Convert.ToDouble(rating["Score"]);
                }
                double averageRating = totalScore / allRatingsForRoom.Count;

                // Actualizar la habitación
                await roomsCollection.Document(existingRating.RoomId).UpdateAsync(
                    new Dictionary<string, object>
                    {
                        { "AverageRating", averageRating }
                    }
                );

                Console.WriteLine($"Reseña actualizada: {ratingId}");
                return existingRating;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al actualizar reseña: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// DeleteRating: Elimina una reseña
        /// </summary>
        public async Task DeleteRating(string ratingId, string userId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(ratingId))
                {
                    throw new ArgumentException("El ID de reseña es requerido");
                }

                var ratingsCollection = _firebaseService.GetCollection("roomRatings");
                var roomsCollection = _firebaseService.GetCollection("rooms");
                var usersCollection = _firebaseService.GetCollection("users");

                // Obtener la reseña
                var ratingDoc = await ratingsCollection.Document(ratingId).GetSnapshotAsync();
                if (!ratingDoc.Exists)
                {
                    throw new InvalidOperationException("La reseña no existe");
                }

                var ratingDict = ratingDoc.ToDictionary();
                var rating = ConvertDictToRating(ratingDict);

                // Verificar que el usuario es propietario
                if (rating.UserId != userId)
                {
                    throw new UnauthorizedAccessException("No tienes permiso para eliminar esta reseña");
                }

                // Eliminar la reseña
                await ratingsCollection.Document(ratingId).DeleteAsync();

                // Recalcular promedio de la habitación
                var allRatingsForRoom = await ratingsCollection
                    .WhereEqualTo("RoomId", rating.RoomId)
                    .GetSnapshotAsync();

                // Si no hay más reseñas, el promedio es 0
                double averageRating = 0;
                int totalRatings = allRatingsForRoom.Count;
                if (totalRatings > 0)
                {
                    double totalScore = 0;
                    foreach (var doc in allRatingsForRoom.Documents)
                    {
                        var r = doc.ToDictionary();
                        totalScore += Convert.ToDouble(r["Score"]);
                    }
                    averageRating = totalScore / totalRatings;
                }

                // Actualizar la habitación
                await roomsCollection.Document(rating.RoomId).UpdateAsync(
                    new Dictionary<string, object>
                    {
                        { "AverageRating", averageRating },
                        { "TotalRatings", totalRatings }
                    }
                );

                // Decrementar TotalRatings del usuario
                var userDoc = await usersCollection.Document(userId).GetSnapshotAsync();
                var userDict = userDoc.ToDictionary();
                var userTotalRatings = (int)(long)userDict["TotalRatings"];
                await usersCollection.Document(userId).UpdateAsync(
                    new Dictionary<string, object>
                    {
                        { "TotalRatings", Math.Max(0, userTotalRatings - 1) }
                    }
                );

                Console.WriteLine($"Reseña eliminada: {ratingId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar reseña: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// HasUserRatedRoom: Verifica si un huésped ya calificó una habitación
        /// </summary>
        public async Task<bool> HasUserRatedRoom(string userId, string roomId)
        {
            try
            {
                // Validar entrada
                if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(roomId))
                {
                    return false;
                }

                var ratingsCollection = _firebaseService.GetCollection("roomRatings");

                // Query: Buscar reseña donde UserId == userId Y RoomId == roomId
                var query = ratingsCollection
                    .WhereEqualTo("UserId", userId)
                    .WhereEqualTo("RoomId", roomId);

                var snapshot = await query.GetSnapshotAsync();

                // Si hay al menos un resultado, el usuario ya calificó
                return snapshot.Count > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al verificar si usuario calificó habitación: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Método privado auxiliar: ConvertToDto
        /// Convierte un ReservationRating (modelo interno) a ReservationRatingDto
        /// </summary>
        private ReservationRatingDto ConvertToDto(ReservationRating rating)
        {
            return new ReservationRatingDto
            {
                Id = rating.Id,
                RoomId = rating.RoomId,
                RoomNameOrNumber = rating.RoomNameOrNumber,
                Score = rating.Score,
                Review = rating.Review,
                GuestName = rating.GuestName,
                CreatedAt = rating.CreatedAt
            };
        }

        /// <summary>
        /// Método privado auxiliar: ConvertDictToRating
        /// Convierte un diccionario de Firestore a objeto ReservationRating
        /// </summary>
        private ReservationRating ConvertDictToRating(Dictionary<string, object> dict)
        {
            return new ReservationRating
            {
                Id = dict["Id"].ToString(),
                RoomId = dict["RoomId"].ToString(),
                RoomNameOrNumber = dict["RoomNameOrNumber"].ToString(),
                UserId = dict["UserId"].ToString(),
                GuestName = dict["GuestName"].ToString(),
                Score = Convert.ToDouble(dict["Score"]),
                Review = dict["Review"].ToString(),
                CreatedAt = ((Timestamp)dict["CreatedAt"]).ToDateTime(),
                UpdatedAt = ((Timestamp)dict["UpdatedAt"]).ToDateTime()
            };
        }
    }
}
