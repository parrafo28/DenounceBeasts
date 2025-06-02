using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations.Schema;

namespace DenounceBeasts.API.Entities
{
    //[Table("Sectors")] 
    public class Sector
    {
        //[Column("ID")]
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Code { get; set; }

        //[Column("NameOfSector")]
        public string Name { get; set; } = string.Empty;

        public int MunicipaltyId { get; set; }
        public virtual Municipalty Municipalty { get; set; }

    }
}

