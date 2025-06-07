using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
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
       
        [StringLength(50)]
        public string Code { get; set; }

        //[Column("NameOfSector")]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        public int MunicipalityId { get; set; }
       public virtual Municipality Municipality { get; set; }

    }
}

