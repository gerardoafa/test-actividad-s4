namespace ActividadS4.API.Services
{
    using ActividadS4.API.DTOs;
    using ActividadS4.API.Models;

    /// <summary>
    /// Implementa la lógica para gestión de huéspedes.
    /// Solo el gerente puede acceder a esta información.
    /// </summary>
    public class GuestService : IGuestService
    {
        private readonly FirebaseService _firebaseService;
        private readonly ILogger<GuestService> _logger;

        /// <summary>Constructor que recibe las dependencias inyectadas</summary>
        public GuestService(FirebaseService firebaseService, ILogger<GuestService> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        /// <summary>Obtiene la lista completa de huéspedes registrados</summary>
        public async Task<List<UserDto>> GetAllGuestsAsync()
        {
            try
            {
                var collection = _firebaseService.GetCollection("users");

                // Filtrar solo usuarios con rol "huesped"
                var snapshot = await collection
                    .WhereEqualTo("Role", "huesped")
                    .GetSnapshotAsync();

                // Convertir cada documento a UserDto (sin datos sensibles)
                return snapshot.Documents
                    .Select(doc =>
                    {
                        var user = doc.ConvertTo<User>();
                        return new UserDto
                        {
                            Id = user.Id,
                            FullName = user.Fullname,
                            Email = user.Email,
                            Role = user.Role,
                            ProfilePictureUrl = user.ProfilePictureUrl,
                            HasReserved = user.HasReserved,
                            ReservedRoom = user.ReservedRoom,
                            ReservedDates = user.ReservedDates
                        };
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener huéspedes: {ex.Message}");
                throw;
            }
        }

        /// <summary>Obtiene la información detallada de un huésped con su reserva</summary>
        public async Task<UserDto?> GetGuestByIdAsync(string guestId)
        {
            try
            {
                var collection = _firebaseService.GetCollection("users");
                var doc = await collection.Document(guestId).GetSnapshotAsync();

                if (!doc.Exists)
                    return null;

                var user = doc.ConvertTo<User>();

                return new UserDto
                {
                    Id = user.Id,
                    FullName = user.Fullname,
                    Email = user.Email,
                    Role = user.Role,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    HasReserved = user.HasReserved,
                    ReservedRoom = user.ReservedRoom,
                    ReservedDates = user.ReservedDates
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener huésped {guestId}: {ex.Message}");
                return null;
            }
        }
    }
}
