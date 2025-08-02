using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.WebClient.Models.ViewModels;

public class LoginViewModel
{
    [Display(Name = "Email")]
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    public string Email { get; set; } = string.Empty;

    [Display(Name = "Contraseña")]
    [Required(ErrorMessage = "La contraseña es requerida")]
    [DataType(DataType.Password)]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Display(Name = "Recordarme")]
    public bool RememberMe { get; set; } = false;

    public string? ReturnUrl { get; set; }
}

public class RegisterViewModel
{
    [Display(Name = "Nombre")]
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
    public string FirstName { get; set; } = string.Empty;

    [Display(Name = "Apellido")]
    [Required(ErrorMessage = "El apellido es requerido")]
    [StringLength(100, ErrorMessage = "El apellido no puede exceder 100 caracteres")]
    public string LastName { get; set; } = string.Empty;

    [Display(Name = "Email")]
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    public string Email { get; set; } = string.Empty;

    [Display(Name = "Teléfono")]
    [Phone(ErrorMessage = "El formato del teléfono no es válido")]
    public string? Phone { get; set; }

    [Display(Name = "Dirección")]
    public string? Address { get; set; }

    [Display(Name = "Contraseña")]
    [Required(ErrorMessage = "La contraseña es requerida")]
    [DataType(DataType.Password)]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Display(Name = "Confirmar Contraseña")]
    [Required(ErrorMessage = "La confirmación de contraseña es requerida")]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ChangePasswordViewModel
{
    [Display(Name = "Contraseña Actual")]
    [Required(ErrorMessage = "La contraseña actual es requerida")]
    [DataType(DataType.Password)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Display(Name = "Nueva Contraseña")]
    [Required(ErrorMessage = "La nueva contraseña es requerida")]
    [DataType(DataType.Password)]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres")]
    public string NewPassword { get; set; } = string.Empty;

    [Display(Name = "Confirmar Nueva Contraseña")]
    [Required(ErrorMessage = "La confirmación de contraseña es requerida")]
    [DataType(DataType.Password)]
    [Compare("NewPassword", ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}

public class UserProfileViewModel
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; }

    public string FullName => $"{FirstName} {LastName}";
}